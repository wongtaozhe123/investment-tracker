"use client";

import { useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";
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
  const {
    holdings,
    settings,
    totals,
    lastRefreshed,
    isRefreshing,
    addHolding,
    deleteHolding,
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
              onClick={refreshAll}
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
            onDelete={deleteHolding}
            onSetManualPrice={(symbol, value) => setManualPrice(symbol, value, currency)}
          />
        </section>
      </main>

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
