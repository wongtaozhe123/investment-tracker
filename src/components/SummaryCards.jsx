import { fmtMoney, fmtPct, relTime } from "@/lib/format";

const TYPE_META = [
  { key: "stock", label: "Stocks", color: "#6C5CE7" },
  { key: "etf", label: "ETFs", color: "#22D3EE" },
  { key: "crypto", label: "Crypto", color: "#FBBF24" },
];

export default function SummaryCards({ totals = {}, currency, lastRefreshed, entryCount = 0 }) {
  const safeTotals = {
    totalValue: totals.totalValue ?? null,
    totalCost: totals.totalCost ?? null,
    totalGain: totals.totalGain ?? null,
    totalGainPct: totals.totalGainPct ?? null,
    byType: totals.byType || {},
  };

  const { totalValue, totalCost, totalGain, totalGainPct, byType } = safeTotals;
  const gain = totalGain ?? 0;
  const gainColor = gain > 0 ? "text-gain" : gain < 0 ? "text-loss" : "text-muted";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative overflow-hidden glass rounded-xl2 p-6">
        <div className="aurora" />
        <p className="text-xs uppercase tracking-wide text-muted relative z-10">Total value</p>
        <p className="text-4xl font-semibold mt-2 nums relative z-10">{fmtMoney(totalValue, currency)}</p>
        <p className={`text-sm mt-2 nums relative z-10 ${gainColor}`}>
          {totalGain != null ? `${fmtMoney(totalGain, currency)} (${fmtPct(totalGainPct)})` : "No cost data yet"}
        </p>
        <p className="text-xs text-muted mt-4 relative z-10">Updated {lastRefreshed ? relTime(lastRefreshed) : "never"}</p>
      </div>

      <div className="glass rounded-xl2 p-6">
        <p className="text-xs uppercase tracking-wide text-muted">Cost basis</p>
        <p className="text-2xl font-semibold mt-2 nums">{fmtMoney(totalCost, currency)}</p>
        <p className="text-sm text-muted mt-2">
          {entryCount} {entryCount === 1 ? "entry" : "entries"}
        </p>
      </div>

      <div className="glass rounded-xl2 p-6">
        <p className="text-xs uppercase tracking-wide text-muted mb-3">Allocation</p>
        <div className="space-y-3">
          {TYPE_META.map(({ key, label, color }) => {
            const val = byType[key] || 0;
            const pct = totalValue ? (val / totalValue) * 100 : 0;
            return (
              <div key={key}>
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>{label}</span>
                  <span className="nums">{pct.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
