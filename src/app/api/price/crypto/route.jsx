import { NextResponse } from 'next/server';

// In-memory cache for the lifetime of the server process — avoids re-searching
// CoinGecko for a ticker -> id mapping we've already resolved.
const idCache = new Map();

// Price cache: key = `${symbols_sorted}:${vs}`, value = { data, expiresAt }
const PRICE_CACHE_TTL_MS = 60_000; // 1 minute
const priceCache = new Map();

/**
 * @param {number} ms 
 * @returns {Promise<void>}
 */
async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * @param {string} url 
 * @param {number} [retries=2] 
 * @param {number} [delayMs=1000] 
 * @returns {Promise<Response>}
 */
async function fetchWithRetry(url, retries = 2, delayMs = 1000) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429 && attempt < retries) {
        await sleep(delayMs * (attempt + 1));
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < retries) await sleep(delayMs * (attempt + 1));
    }
  }
  throw lastError || new Error('fetch failed');
}

/**
 * @param {string} symbol 
 * @returns {Promise<string>}
 */
async function resolveId(symbol) {
  const key = symbol.toUpperCase();
  const cached = idCache.get(key);
  if (cached) return cached;

  const res = await fetchWithRetry(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(symbol)}`);
  if (!res.ok) throw new Error('coingecko search failed');
  const data = await res.json();
  const coins = data.coins || [];
  const match = coins.find((c) => c.symbol?.toLowerCase() === symbol.toLowerCase()) || coins[0];
  if (!match) throw new Error('coin not found');
  idCache.set(key, match.id);
  return match.id;
}

/**
 * @param {string} from 
 * @param {string} to 
 * @returns {Promise<number>}
 */
async function fxRate(from, to) {
  if (from.toUpperCase() === to.toUpperCase()) return 1;
  const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
  if (!res.ok) throw new Error('fx fetch failed');
  const data = await res.json();
  const rate = data.rates?.[to.toUpperCase()];
  if (!rate) throw new Error('no fx rate');
  return rate;
}

/**
 * GET handler for fetching crypto prices
 * @param {import('next/server').NextRequest} req 
 */
export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const symbols = (searchParams.get('symbol') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const vs = (searchParams.get('vs') || 'usd').toLowerCase();

  if (!symbols.length) {
    return NextResponse.json({ error: 'missing symbols' }, { status: 400 });
  }

  const result = {};
  const idMap = {};

  await Promise.all(
    symbols.map(async (sym) => {
      try {
        idMap[sym] = await resolveId(sym);
      } catch {
        idMap[sym] = null;
      }
    })
  );

  const ids = [...new Set(Object.values(idMap).filter(Boolean))];
  let priceData = {};

  // Check price cache before hitting CoinGecko (sort copy to avoid mutating ids)
  const cacheKey = `${[...ids].sort().join(',')}:${vs}`;
  const cached = priceCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    priceData = cached.data;
  } else if (ids.length) {
    try {
      const res = await fetchWithRetry(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=${vs},usd`
      );
      if (res.ok) {
        priceData = await res.json();
        priceCache.set(cacheKey, { data: priceData, expiresAt: Date.now() + PRICE_CACHE_TTL_MS });
      }
    } catch {
      // fall through — result stays empty for these symbols
    }
  }

  for (const sym of symbols) {
    const id = idMap[sym];
    const p = id ? priceData[id] : undefined;
    if (!p) {
      result[sym] = { error: 'not found' };
      continue;
    }
    let price = p[vs];
    if (price == null && p.usd != null) {
      try {
        const rate = await fxRate('USD', vs.toUpperCase());
        price = p.usd * rate;
      } catch {
        price = undefined; // In JS, this naturally fails the `price != null` check below
      }
    }
    result[sym] = price != null ? { price, currency: vs.toUpperCase() } : { error: 'no price' };
  }

  return NextResponse.json(result);
}