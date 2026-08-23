import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for the lifetime of the server process — avoids re-searching
// CoinGecko for a ticker -> id mapping we've already resolved.
const idCache = new Map<string, string>();

async function resolveId(symbol: string): Promise<string> {
  const key = symbol.toUpperCase();
  const cached = idCache.get(key);
  if (cached) return cached;

  const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(symbol)}`);
  if (!res.ok) throw new Error('coingecko search failed');
  const data = await res.json();
  const coins = data.coins || [];
  const match = coins.find((c: any) => c.symbol?.toLowerCase() === symbol.toLowerCase()) || coins[0];
  if (!match) throw new Error('coin not found');
  idCache.set(key, match.id);
  return match.id;
}

async function fxRate(from: string, to: string): Promise<number> {
  if (from.toUpperCase() === to.toUpperCase()) return 1;
  const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
  if (!res.ok) throw new Error('fx fetch failed');
  const data = await res.json();
  const rate = data.rates?.[to.toUpperCase()];
  if (!rate) throw new Error('no fx rate');
  return rate;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const symbols = (searchParams.get('symbol') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const vs = (searchParams.get('vs') || 'usd').toLowerCase();

  if (!symbols.length) {
    return NextResponse.json({ error: 'missing symbols' }, { status: 400 });
  }

  const result: Record<string, { price: number; currency: string } | { error: string }> = {};
  const idMap: Record<string, string | null> = {};

  await Promise.all(
    symbols.map(async (sym) => {
      try {
        idMap[sym] = await resolveId(sym);
      } catch {
        idMap[sym] = null;
      }
    })
  );

  const ids = [...new Set(Object.values(idMap).filter(Boolean))] as string[];
  let priceData: Record<string, Record<string, number>> = {};

  if (ids.length) {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=${vs},usd`
      );
      if (res.ok) priceData = await res.json();
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
        price = undefined as any;
      }
    }
    result[sym] = price != null ? { price, currency: vs.toUpperCase() } : { error: 'no price' };
  }

  return NextResponse.json(result);
}
