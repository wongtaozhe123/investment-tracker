import { NextResponse } from 'next/server';


export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ quotes: [] });
  }

  try {
    const url = new URL(process.env.NEXT_PUBLIC_YAHOO_FINANCE_SEARCH_URL);
    url.searchParams.set("q", query);
    
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Yahoo Finance search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}