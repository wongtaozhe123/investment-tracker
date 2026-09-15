import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

export const CURRENCIES = ["SGD", "USD", "EUR", "GBP", "JPY", "HKD", "AUD", "CNY", "MYR", "INR", "KRW", "THB", "IDR", "PHP", "VND"];

const safeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const FX_TTL_MS = 10 * 60 * 1000;

const fetchFxRate = async (from, to) => {
  if (!from || !to || from.toUpperCase() === to.toUpperCase()) return 1;
  const resp = await fetch(`/api/fx?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { cache: "no-store" });
  if (!resp.ok) throw new Error(`FX ${from}->${to} failed`);
  const data = await resp.json();
  const rate = Number(data.rate);
  return Number.isFinite(rate) && rate > 0 ? rate : null;
};

const computeTotals = (holdings, prices, manualPrices, fx, targetCurrency) => {
  const target = (targetCurrency || "SGD").toUpperCase();
  return holdings.reduce(
    (acc, h) => {
      const qty = safeNumber(h.quantity);
      const nativeCcy = (h.priceCurrency || "USD").toUpperCase();
      const costRate = fx[nativeCcy] ?? (nativeCcy === target ? 1 : 1);
      const nativeCost = safeNumber(h.pricePaid) * qty;
      const cost = nativeCost * costRate;

      const priceRecord = manualPrices?.[h.symbol] || prices?.[h.symbol] || null;
      const price = priceRecord?.price ?? null;
      const priceCcy = (priceRecord?.currency || priceRecord?.nativeCurrency || h.priceCurrency || "USD").toUpperCase();
      const priceRate = priceCcy === target ? 1 : fx[priceCcy] ?? null;
      const nativeValue = price != null ? price * qty : null;
      const value = nativeValue != null && priceRate ? nativeValue * priceRate : null;

      if (value != null) {
        acc.totalValue += value;
        acc.byType[h.type] = (acc.byType[h.type] || 0) + value;
      }
      acc.totalCost += cost;
      if (value != null) acc.totalGain += value - cost;

      acc.detail.push({
        id: h.id,
        holding: h,
        currentPrice: nativeValue != null && priceRate ? price * priceRate : null,
        marketValue: value,
        costBasis: cost,
        gain: value != null ? value - cost : null,
        gainPct: value != null && cost ? ((value - cost) / cost) * 100 : null,
        priceInfo: priceRecord,
        totalValue: acc.totalValue,
      });
      return acc;
    },
    { totalValue: 0, totalCost: 0, totalGain: 0, totalGainPct: 0, byType: {}, detail: [] }
  );
};

export function usePortfolio() {
  const { data: session } = useSession();
  const email = session?.user?.email;
  const [holdings, setHoldings] = useState([]);
  const [settings, setSettings] = useState({ user_id: email || "", currency: "SGD" });
  const [manualPrices, setManualPrices] = useState({});
  const [prices, setPrices] = useState({});
  const [fxRates, setFxRates] = useState({});
  const [fxUpdatedAt, setFxUpdatedAt] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  const targetCurrency = (settings?.currency || "SGD").toUpperCase();

  useEffect(() => {
    if (!email) return undefined;
    let cancelled = false;
    const load = async () => {
      try {
        const [holdingsRes, settingsRes, manualRes] = await Promise.all([
          fetch("/api/portfolio/holdings"),
          fetch("/api/portfolio/settings"),
          fetch("/api/portfolio/manual-prices"),
        ]);
        if (cancelled) return;
        if (holdingsRes.ok) {
          const { holdings: rows } = await holdingsRes.json();
          setHoldings(rows || []);
        }
        if (settingsRes.ok) {
          const { settings: row } = await settingsRes.json();
          setSettings(row || { user_id: email, currency: "SGD" });
        }
        if (manualRes.ok) {
          const { manualPrices: rows } = await manualRes.json();
          setManualPrices(Object.fromEntries((rows || []).map((p) => [p.symbol, p])));
        }
        setHydrated(true);
      } catch (err) {
        console.error("portfolio load failed", err);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [email]);

  useEffect(() => {
    if (!hydrated || !email) return;
    const id = setTimeout(() => {
      fetch("/api/portfolio/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      }).catch((err) => console.error("settings save failed", err));
    }, 500);
    return () => clearTimeout(id);
  }, [settings, hydrated, email]);

  useEffect(() => {
    let cancelled = false;
    const needed = new Set([targetCurrency]);
    holdings.forEach((h) => {
      if (h.priceCurrency) needed.add(h.priceCurrency.toUpperCase());
    });
    Object.values(manualPrices).forEach((p) => {
      if (p?.currency) needed.add(String(p.currency).toUpperCase());
    });
    Object.values(prices).forEach((p) => {
      if (p?.currency) needed.add(String(p.currency).toUpperCase());
      if (p?.nativeCurrency) needed.add(String(p.nativeCurrency).toUpperCase());
    });

    if (fxUpdatedAt && Date.now() - fxUpdatedAt < FX_TTL_MS) {
      const allFresh = [...needed].every((c) => c === targetCurrency || fxRates[c]);
      if (allFresh) return undefined;
    }

    const refresh = async () => {
      const next = { ...fxRates };
      await Promise.all(
        [...needed].map(async (ccy) => {
          if (ccy === targetCurrency) {
            next[ccy] = 1;
            return;
          }
          try {
            const rate = await fetchFxRate(ccy, targetCurrency);
            if (rate) next[ccy] = rate;
          } catch (err) {
            console.error("fx failed", ccy, targetCurrency, err);
          }
        })
      );
      if (cancelled) return;
      setFxRates(next);
      setFxUpdatedAt(Date.now());
    };

    refresh();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetCurrency, holdings, manualPrices, prices]);

  const refreshAll = useCallback(async () => {
    if (!holdings.length) return { failed: [] };
    setIsRefreshing(true);
    try {
      const next = {};
      const failed = [];
      const target = settings?.currency || "USD";
      const vs = target.toLowerCase();
      const now = Date.now();

      // Separate crypto from non-crypto holdings
      const cryptoHoldings = holdings.filter((h) => h.type === "crypto");
      const otherHoldings = holdings.filter((h) => h.type !== "crypto");

      // Fetch non-crypto (stocks/ETFs) individually
      await Promise.all(
        otherHoldings.map(async (h) => {
          try {
            const url = `/api/price/stock?symbol=${h.symbol}&vs=${target}`;
            const res = await fetch(url);
            if (!res.ok) { failed.push(h.symbol); return; }
            const data = await res.json();
            if (!data || typeof data.price !== "number") { failed.push(h.symbol); return; }
            next[h.symbol] = {
              price: data.price,
              currency: data.currency || target,
              nativeCurrency: data.nativeCurrency || data.currency || target,
              source: "live",
              updatedAt: now,
            };
          } catch {
            failed.push(h.symbol);
          }
        })
      );

      // Batch ALL crypto symbols into a single API call to avoid rate-limiting
      if (cryptoHoldings.length) {
        const cryptoSymbols = cryptoHoldings.map((h) => h.symbol).join(",");
        try {
          const url = `/api/price/crypto?symbol=${cryptoSymbols}&vs=${vs}`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            for (const h of cryptoHoldings) {
              const payload = data?.[h.symbol];
              if (!payload || typeof payload.price !== "number") { failed.push(h.symbol); continue; }
              next[h.symbol] = {
                price: payload.price,
                currency: payload.currency || target,
                nativeCurrency: payload.nativeCurrency || payload.currency || target,
                source: "live",
                updatedAt: now,
              };
            }
          } else {
            // Batch request failed — mark all crypto as failed
            for (const h of cryptoHoldings) failed.push(h.symbol);
          }
        } catch {
            for (const h of cryptoHoldings) failed.push(h.symbol);
        }
      }

      setPrices((prev) => ({ ...prev, ...next }));
      setLastRefreshed(Date.now());
      return { failed };
    } finally {
      setIsRefreshing(false);
    }
  }, [holdings, settings?.currency]);

  const addHolding = useCallback(async (h) => {
    setHoldings((prev) => [...prev, h]);
  }, []);

  const deleteHolding = useCallback(async (id) => {
    setHoldings((prev) => prev.filter((row) => row.id !== id));
    if (!email) return;
    try {
      await fetch("/api/portfolio/holdings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error("holdings delete failed", err);
    }
  }, [email]);

  const updateHolding = useCallback(async (id, fields) => {
    if (!email) return;
    try {
      await fetch("/api/portfolio/holdings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...fields }),
      });
    } catch (err) {
      console.error("holdings update failed", err);
    }
    setHoldings((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...fields } : h))
    );
  }, [email]);

  const setManualPrice = useCallback((symbol, value, currency) => {
    setManualPrices((prev) => ({
      ...prev,
      [symbol]: { symbol, price: value, currency: (currency || "USD").toUpperCase(), source: "manual" },
    }));
  }, []);

  const changeCurrency = useCallback((currency) => {
    const next = (currency || "SGD").toUpperCase();
    setSettings((prev) => {
      if ((prev?.currency || "").toUpperCase() === next) return prev;
      return { ...prev, currency: next };
    });
  }, []);

  // When the target currency changes (and we already have holdings),
  // clear the cached native prices and refetch them in the new currency
  // so the totals update without the user pressing "Refresh prices".
  useEffect(() => {
    if (!hydrated || !holdings.length) return;
    setPrices({});
    setLastRefreshed(null);
    refreshAll();
    // refreshAll is stable via useCallback; we only want to fire on currency change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetCurrency]);

  const totals = computeTotals(holdings, prices, manualPrices, fxRates, targetCurrency);
  if (totals.totalCost) {
    totals.totalGainPct = (totals.totalGain / totals.totalCost) * 100;
  }

  return {
    holdings,
    settings,
    prices,
    manualPrices,
    totals,
    fxRates,
    isRefreshing,
    lastRefreshed,
    hydrated,
    refreshAll,
    addHolding,
    deleteHolding,
    updateHolding,
    setManualPrice,
    changeCurrency,
  };
}
