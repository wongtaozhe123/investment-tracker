import { NextResponse } from "next/server";
import { validateTicker } from "@/lib/yahoo-finance/api";


export async function POST(req) {
  try {
    const body = await req.json();
    const { symbol } = body;

    if (!symbol || typeof symbol !== "string") {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 }
      );
    }

    // Validate the ticker
    const result = await validateTicker(symbol.trim().toUpperCase());

    if (!result.valid) {
      return NextResponse.json(
        { error: result.message || `Invalid ticker: ${symbol}` },
        { status: 400 }
      );
    }

    // Ticker is valid, return success
    return NextResponse.json({ 
      valid: true,
      symbol: result.symbol,
      message: "Valid ticker"
    });
  } catch (err) {
    console.error("Ticker validation error:", err);
    return NextResponse.json(
      { error: err.message || "Could not validate ticker" },
      { status: 500 }
    );
  }
}