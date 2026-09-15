async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchTickers(query) {
  if (!query || query.trim().length === 0) return [];
  
  const url = new URL('/api/ticker/search', typeof window !== 'undefined' ? window.location.origin : process.env.NEXTAUTH_URL);
  url.searchParams.set("q", query);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract results from Yahoo Finance search response
    const results = [];
    if (data.quotes && Array.isArray(data.quotes)) {
      for (const quote of data.quotes) {
        try {
          const symbol = quote.symbol || quote.shortName || "";
          if (!symbol) continue;

          // Determine asset type from the exchange or short name
          let type = "unknown";
          
          if (quote.type === "CRYPTOCURRENCY") {
            type = "crypto";
          } else if (quote.type === "ETF" || symbol.includes(".X") || symbol.includes(".Y")) {
            type = "etf";
          } else if (symbol.startsWith("BTC") || symbol.startsWith("ETH") || 
                     (quote.shortName && quote.shortName.toLowerCase().includes("coin")) || 
                     (quote.shortName && quote.shortName.toLowerCase().includes("crypto"))) {
            type = "crypto";
          }

          results.push({
            ...quote,
            type
          });
        } catch (e) {
          // Skip malformed quotes
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Yahoo Finance search error:", error);
    return [];
  }
}

// call when add to portfolio to validate the ticker symbol
export async function getTickerPrice(symbol) {
  if (!symbol || symbol.trim().length === 0) return null;

  const cleanSymbol = symbol.toUpperCase();
  
  // Try to fetch from Yahoo Finance
  try {
    const url = new URL(process.env.NEXT_PUBLIC_YAHOO_FINANCE_QUOTE_URL);
    url.pathname += `/${cleanSymbol}`;

    url.searchParams.set("interval", "1d");
    url.searchParams.set("range", "1mo");
    
    const response = await fetchWithTimeout(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    }, 10000); // 10 second timeout for price fetches

    if (!response.ok) {
      throw new Error(`Price fetch error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.chart && data.chart.result) {
      const result = data.chart.result[0];
      
      // Get the most recent price from the quote array
      const quotes = result.quotes ?? [];
      const lastQuote = quotes[quotes.length - 1] || null;

      return {
        symbol: cleanSymbol,
        price: lastQuote?.close ?? lastQuote?.lastPrice ?? null,
        changePercent: lastQuote?.changePercent ?? null,
        currency: result.currency ?? "USD",
        exchange: result.exchangeName ?? "",
        timestamp: lastQuote?.timestamp ? new Date(lastQuote.timestamp * 1000) : null,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

export async function validateTicker(symbol) {
  const result = await getTickerPrice(symbol);
  
  if (result) {
    return { valid: true };
  }

  // Common invalid ticker patterns
  if (!symbol.match(/^[A-Z0-9\.\-\s]+$/)) {
    return { 
      valid: false, 
      message: "Invalid ticker format. Use uppercase letters and numbers (e.g., AAPL, MSFT)" 
    };
  }

  return { 
    valid: false, 
    message: `Ticker "${symbol}" not found on Yahoo Finance` 
  };
}