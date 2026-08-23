"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { fmtMoney, fmtPct, relTime } from "@/lib/format";

const TYPE_DOT = {
  stock: "#6C5CE7",
  etf: "#22D3EE",
  crypto: "#FBBF24",
};

const TYPE_LABEL = {
  stock: "Stock",
  etf: "ETF",
  crypto: "Crypto",
};

export default function HoldingsTable({ rows, currency, onDelete, onSetManualPrice }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");

  if (!rows.length) {
    return (
      <div className="glass rounded-xl2 p-14 text-center">
        <p className="text-muted">No holdings yet. Add your first purchase to see it here.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl2 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border">
              <th className="py-3 px-4">Asset</th>
              <th className="py-3 px-4 text-right">Qty</th>
              <th className="py-3 px-4 text-right">Avg cost</th>
              <th className="py-3 px-4 text-right">Price</th>
              <th className="py-3 px-4 text-right">Value</th>
              <th className="py-3 px-4 text-right">Gain / loss</th>
              <th className="py-3 px-4 text-right">Updated</th>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ holding: h, currentPrice, marketValue, gain, gainPct, priceInfo }) => {
              const gainColor = gain == null
                ? "text-muted"
                : gain > 0
                ? "text-gain"
                : gain < 0
                ? "text-loss"
                : "text-muted";
              const isEditing = editingId === h.id;

              return (
                <tr key={h.id} className="border-b border-border/60 hover:bg-surface2/60 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: TYPE_DOT[h.type] }}
                      />
                      <div>
                        <div className="font-medium">{h.symbol}</div>
                        <div className="text-xs text-muted">{TYPE_LABEL[h.type] || h.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right nums">{h.quantity}</td>
                  <td className="py-3 px-4 text-right nums">
                    {fmtMoney(h.pricePaid, h.priceCurrency || currency)}
                  </td>
                  <td className="py-3 px-4 text-right nums">
                    {isEditing ? (
                      <div className="flex items-center gap-1 justify-end">
                        <input
                          autoFocus
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          placeholder={currency}
                          className="w-20 bg-surface border border-border rounded px-2 py-1 text-right nums focus:outline-none focus:ring-2 focus:ring-primary/60"
                        />
                        <button
                          className="p-1 text-gain"
                          aria-label="Save price"
                          onClick={() => {
                            const v = parseFloat(draft);
                            if (Number.isFinite(v) && v >= 0) {
                              onSetManualPrice?.(h.symbol, v);
                              setEditingId(null);
                              setDraft("");
                            }
                          }}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          className="p-1 text-loss"
                          aria-label="Cancel"
                          onClick={() => {
                            setEditingId(null);
                            setDraft("");
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : currentPrice != null ? (
                      <div>
                        {fmtMoney(currentPrice, currency)}
                        {priceInfo?.source === "manual" && (
                          <div className="text-[10px] text-warn">manual</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted">--</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right nums">{fmtMoney(marketValue, currency)}</td>
                  <td className={`py-3 px-4 text-right nums ${gainColor}`}>
                    {gain != null ? `${fmtMoney(gain, currency)} (${fmtPct(gainPct)})` : "--"}
                  </td>
                  <td className="py-3 px-4 text-right text-xs text-muted">
                    {priceInfo ? relTime(priceInfo.updatedAt) : "never"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      {!isEditing && (
                        <button
                          className="p-1.5 rounded hover:bg-surface2 text-muted hover:text-white"
                          aria-label="Set price manually"
                          onClick={() => {
                            setEditingId(h.id);
                            setDraft("");
                          }}
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                      <button
                        className="p-1.5 rounded hover:bg-surface2 text-muted hover:text-loss"
                        aria-label="Delete holding"
                        onClick={() => onDelete?.(h.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
