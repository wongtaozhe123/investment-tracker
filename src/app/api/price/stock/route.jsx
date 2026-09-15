import { NextResponse } from 'next/server';


async function fxRate(from, to) {
  if (from.toUpperCase() === to.toUpperCase()) return 1;
  const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
  if (!res.ok) throw new Error('fx fetch failed');
  const data = await res.json();
  const rate = data.rates?.[to.toUpperCase()];
  if (!rate) throw new Error('no fx rate');
  return rate;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');
  const vs = (searchParams.get('vs') || 'USD').toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: 'missing symbol' }, { status: 400 });
  }
  
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortfolioTracker/1.0)' },
      // Prices change constantly — never let Next.js cache this route.
      cache: 'no-store',
    });
    
    if (!res.ok) throw new Error('yahoo finance request failed');
    
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) throw new Error('no chart data returned');

    const price = result.meta.regularMarketPrice;
    const nativeCurrency = result.meta.currency;
    if (price == null) throw new Error('no price in response');

    let converted = price;
    if (symbol === '2801.TW') console.log('data: ', nativeCurrency, vs, price);
    if (nativeCurrency !== vs) {
      converted = price * (await fxRate(nativeCurrency, vs));
    }

    return NextResponse.json({ price: converted, currency: vs, nativeCurrency });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || 'failed to fetch price' }, 
      { status: 502 }
    );
  }
}