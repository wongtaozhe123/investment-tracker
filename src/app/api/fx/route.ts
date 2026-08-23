import { NextRequest, NextResponse } from "next/server";

const FX_TTL_SECONDS = 60 * 10; // 10 minutes

const memoryCache = new Map<string, { rate: number; fetchedAt: number }>();

async function fetchLiveRate(from: string, to: string): Promise<number> {
  const res = await fetch(
    `https://api.frankfurter.app/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`fx request failed (${res.status})`);
  const data = await res.json();
  const rate = Number(data?.rates?.[to.toUpperCase()]);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("no rate returned");
  }
  return rate;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = (searchParams.get("from") || "").toUpperCase();
  const to = (searchParams.get("to") || "").toUpperCase();

  if (!from || !to) {
    return NextResponse.json({ error: "missing from/to params" }, { status: 400 });
  }
  if (from === to) {
    return NextResponse.json({ rate: 1, currency: to, source: "identity" });
  }

  const cacheKey = `${from}:${to}`;
  const cached = memoryCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.fetchedAt < FX_TTL_SECONDS * 1000) {
    return NextResponse.json(
      { rate: cached.rate, currency: to, source: "cache" },
      { headers: { "Cache-Control": `public, max-age=${FX_TTL_SECONDS}` } }
    );
  }

  try {
    const rate = await fetchLiveRate(from, to);
    memoryCache.set(cacheKey, { rate, fetchedAt: now });
    return NextResponse.json(
      { rate, currency: to, source: "live" },
      { headers: { "Cache-Control": `public, max-age=${FX_TTL_SECONDS}` } }
    );
  } catch (err: any) {
    if (cached) {
      return NextResponse.json(
        { rate: cached.rate, currency: to, source: "stale-cache" },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { error: err?.message || "failed to fetch rate" },
      { status: 502 }
    );
  }
}
