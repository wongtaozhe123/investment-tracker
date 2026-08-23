"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { uid } from "@/lib/format";

const TYPES = ["stock-etf", "crypto"];
const TYPE_LABEL = { "stock-etf": "Stock / ETF", crypto: "Crypto" };

export default function AddHoldingModal({
  open,
  currencies,
  defaultCurrency,
  onClose,
  onAdd,
}) {
  const [type, setType] = useState("stock-etf");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [priceCcy, setPriceCcy] = useState(defaultCurrency);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setPriceCcy(defaultCurrency);
    }
  }, [open, defaultCurrency]);

  if (!open) return null;

  const reset = () => {
    setSymbol("");
    setQuantity("");
    setPrice("");
    setError(null);
    setSaving(false);
  };

  async function submit(e) {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const p = price ? parseFloat(price) : 0;
    if (!symbol.trim() || !(qty > 0)) {
      setError("Enter a valid ticker and quantity.");
      return;
    }
    const holding = {
      id: uid(),
      user_id: "",
      type: type === "stock-etf" ? "stock" : type,
      symbol: symbol.trim().toUpperCase(),
      quantity: qty,
      pricePaid: p,
      priceCurrency: priceCcy,
      dateBought: date,
    };
    try {
      setSaving(true);
      const resp = await fetch("/api/portfolio/holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holding }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body?.error || "Could not save the holding");
      }
      onAdd?.(holding);
      reset();
      onClose();
    } catch (err) {
      setError(err?.message || "Could not save the holding");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass rounded-xl2 w-full max-w-md p-6 relative">
        <button
          onClick={() => {
            reset();
            onClose();
          }}
          aria-label="Close"
          className="absolute top-4 right-4 text-muted hover:text-white"
        >
          <X size={18} />
        </button>
        <h2 className="text-lg font-semibold mb-1">Add a purchase</h2>
        <p className="mb-4 text-xs text-muted">
          Saved to your account so it follows you on every device.
        </p>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setType(t)}
                className={`py-2 rounded-lg text-sm border transition ${
                  type === t
                    ? "bg-primary border-primary text-white"
                    : "border-border text-muted hover:border-primary/50"
                }`}
              >
                {TYPE_LABEL[t]}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs text-muted">Ticker</label>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g. AAPL, D05.SI, BTC"
              className="w-full mt-1 bg-surface border border-border rounded-lg px-3 py-2 nums focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted">Quantity</label>
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                step="any"
                min="0"
                className="w-full mt-1 bg-surface border border-border rounded-lg px-3 py-2 nums focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
            </div>
            <div>
              <label className="text-xs text-muted">Date bought</label>
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                type="date"
                className="w-full mt-1 bg-surface border border-border rounded-lg px-3 py-2 nums focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted">Price paid / unit</label>
            <div className="flex gap-2 mt-1">
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                step="any"
                min="0"
                className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 nums focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
              <select
                value={priceCcy}
                onChange={(e) => setPriceCcy(e.target.value)}
                className="bg-surface border border-border rounded-lg px-2 nums focus:outline-none focus:ring-2 focus:ring-primary/60"
              >
                {(currencies || ["SGD"]).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? <p className="text-loss text-sm">{error}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-white rounded-lg py-2.5 font-medium hover:opacity-90 transition mt-2 inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            <span>{saving ? "Saving..." : "Add to portfolio"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
