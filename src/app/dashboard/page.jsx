"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Plus, RefreshCcw, AlertTriangle, X } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import SummaryCards from "@/components/SummaryCards";
import HoldingsTable from "@/components/HoldingsTable";
import AddHoldingModal from "@/components/AddHoldingModal";
import { CURRENCIES, usePortfolio } from "@/lib/usePortfolio";

const CURRENCY_OPTIONS = Array.isArray(CURRENCIES) && CURRENCIES.length
  ? CURRENCIES
  : ["SGD", "USD", "EUR", "GBP", "JPY", "HKD", "AUD", "CNY", "MYR"];

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg, type = "warn") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const {
    holdings,
    settings,
    totals,
    lastRefreshed,
    isRefreshing,
    addHolding,
    deleteHolding,
    updateHolding,
    setManualPrice,
    changeCurrency,
    refreshAll,
  } = usePortfolio();

  const currency = settings?.currency || "SGD";
  const rows = totals.detail || [];

  return (
    <div className="min-h-screen bg-bg text-white">
      <AppHeader />
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Overview</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your portfolio</h1>
            <p className="mt-1 text-sm text-muted">
              Live prices, cost basis, and allocation across every device you sign in from.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={currency}
              onChange={(e) => changeCurrency(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white focus:border-primary/60 focus:outline-none"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90"
            >
              <Plus size={15} />
              Add holding
            </button>
            <button
              type="button"
              onClick={async () => {
                const result = await refreshAll();
                if (result?.failed?.length) {
                  showToast(`Could not fetch prices for: ${result.failed.join(", ")}`);
                }
              }}
              disabled={isRefreshing || holdings.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-white transition hover:border-primary/50 hover:bg-surface2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw size={15} className={isRefreshing ? "animate-spin" : ""} />
              Refresh prices
            </button>
          </div>
        </section>

        <SummaryCards
          totals={totals}
          currency={currency}
          lastRefreshed={lastRefreshed}
          entryCount={holdings.length}
        />

        <section id="holdings" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Holdings</h2>
            <p className="text-xs text-muted">{`Reporting in ${currency}`}</p>
          </div>
          <HoldingsTable
            rows={rows}
            currency={currency}
            totalValue={totals.totalValue || 0}
            onDelete={deleteHolding}
            onSetManualPrice={(symbol, value) => setManualPrice(symbol, value, currency)}
            onUpdateHolding={updateHolding}
          />
        </section>
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg bg-warn/90 backdrop-blur-sm px-4 py-3 text-sm text-white shadow-lg max-w-md">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-2 shrink-0 text-white/70 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      <AddHoldingModal
        open={open}
        onClose={() => setOpen(false)}
        currencies={CURRENCY_OPTIONS}
        defaultCurrency={currency}
        onAdd={addHolding}
      />
    </div>
  );
}
