"use client";

import { useState, useRef, useEffect } from "react";
import { useTickerSearch } from "@/lib/yahoo-finance/useTickerSearch";
import { Loader2, Search } from "lucide-react";

export default function TickerInput({
  value,
  onChange,
  placeholder = "Search ticker...",
  label = "Ticker",
  error,
  disabled = false,
  type = "stock-etf", // 'stock-etf' or 'crypto'
}) {
  const [focused, setFocused] = useState(false);
  const searchRef = useRef(null);
  
  // Only show suggestions for stock/ETF, not crypto
  const useSuggestions = type === "stock-etf";
  
  const { suggestions, loading, error: searchError, search, clear } = useTickerSearch({
    debounceMs: 300,
    maxResults: 10,
  });

  // Close dropdown when clicking outside (only for stock/ETF)
  useEffect(() => {
    if (!useSuggestions) return;
    
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setFocused(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [useSuggestions]);

  // Search when value changes (only for stock/ETF)
  useEffect(() => {
    if (!useSuggestions) return;
    
    if (value.length >= 2) {
      search(value);
    } else {
      clear();
    }
  }, [value, search, clear]);

  const handleSelect = (suggestion) => {
    onChange(suggestion.symbol);
    clear(); // Clear suggestions after selection
    setFocused(false);
  };

  return (
    <div className="relative">
      <label className="text-xs text-muted block mb-1">{label}</label>
      
      <div className={`flex items-center gap-2 bg-surface border rounded-lg px-3 py-2 transition ${
        error 
          ? "border-loss focus:ring-2 focus:ring-loss/60" 
          : focused || loading
            ? "border-primary ring-2 ring-primary/20"
            : "border-border focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/60"
      }`}>
        <Search size={14} className="text-muted shrink-0" />
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="flex-1 bg-transparent outline-none text-sm nums placeholder:text-muted"
        />

        {loading && (
          <Loader2 size={14} className="text-primary animate-spin shrink-0" />
        )}
      </div>

      {/* Error message */}
      {error ? (
        <p className="text-loss text-xs mt-1">{error}</p>
      ) : null}

      {/* Suggestions dropdown - only for stock/ETF */}
      {useSuggestions && (focused || suggestions.length > 0) && (
        <div 
          ref={searchRef}
          className={`absolute z-50 w-full mt-1 bg-surface border rounded-lg shadow-xl max-h-64 overflow-y-auto ${
            error ? "border-loss" : "border-border"
          }`}
        >
          {loading && suggestions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Searching...
            </div>
          ) : null}

          {searchError && suggestions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-loss">{searchError}</div>
          ) : null}
          
          {!loading && suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <button
                key={suggestion.symbol}
                onClick={() => handleSelect(suggestion)}
                className="group w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface/80 border-b border-border last:border-b-0"
              >
                {/* Left Section: Indicator, Symbol, and Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Type Indicator Dot */}
                  <span
                    className={`shrink-0 w-2 h-2 rounded-full ${
                      suggestion.type === "crypto" ? "bg-purple-500" :
                      suggestion.type === "etf" ? "bg-green-500" :
                      "bg-blue-500"
                    }`}
                    aria-hidden="true"
                  />

                  <div className="flex flex-col min-w-0 flex-1">
                    {/* Symbol (Bold) */}
                    <span className="font-semibold text-sm text-white truncate">
                      {suggestion.symbol}
                    </span>
                    
                    {/* Company Name and Exchange (Muted, separated by a dot) */}
                    <div className="flex items-center gap-1.5 text-xs text-muted truncate">
                      {suggestion.shortname && (
                        <span className="truncate">{suggestion.shortname}</span>
                      )}
                      {suggestion.shortname && suggestion.exchDisp && (
                        <span className="shrink-0 opacity-50">•</span>
                      )}
                      {suggestion.exchDisp && (
                        <span className="shrink-0">{suggestion.exchDisp}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Section: Price and Change Percent */}
                {suggestion.price !== undefined && suggestion.price !== null && (
                  <div className="flex flex-col items-end shrink-0">
                    {/* Price */}
                    <span className="text-sm font-medium text-white">
                      {suggestion.type === "crypto" 
                        ? `$${suggestion.price.toFixed(2)}`
                        : `${suggestion.price.toFixed(2)} ${suggestion.exchDisp || "USD"}`}
                    </span>
                    
                    {/* Change Percent */}
                    {suggestion.changePercent !== null && suggestion.changePercent !== undefined && (
                      <span className={`text-xs font-medium ${
                        suggestion.changePercent >= 0 ? "text-gain" : "text-loss"
                      }`}>
                        {suggestion.changePercent > 0 ? "+" : ""}{suggestion.changePercent.toFixed(2)}%
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))
          ) : null}

          {!loading && suggestions.length === 0 && !searchError && (
            <div className="px-3 py-2 text-sm text-muted">
              Start typing to search for tickers...
            </div>
          )}
        </div>
      )}
    </div>
  );
}