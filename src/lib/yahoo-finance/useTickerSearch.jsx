"use client";

import { useState, useCallback } from "react";
import { searchTickers, validateTicker } from "./api";

export function useTickerSearch(options = {}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { debounceMs = 300, maxResults = 10 } = options;

  const search = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchTickers(query);
      
      // Limit results and filter by relevance
      const filtered = results.slice(0, maxResults).map(r => ({
        ...r,
        symbol: r.symbol.trim().toUpperCase(),
      }));

      setSuggestions(filtered);
    } catch (err) {
      console.error("Ticker search error:", err);
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [debounceMs, maxResults]);

  const validate = useCallback(async (symbol) => {
    try {
      return await validateTicker(symbol);
    } catch (err) {
      console.error("Validation error:", err);
      return { 
        valid: false, 
        message: "Could not verify ticker" 
      };
    }
  }, []);


  const clear = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    loading,
    error,
    search,
    validate,
    clear,
  };
}