export function fmtMoney(num, ccy) {
  if (num == null || Number.isNaN(num)) return '—';
  try {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: ccy,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${ccy} ${num.toFixed(2)}`;
  }
}

export function fmtPct(num) {
  if (num == null || Number.isNaN(num)) return '—';
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

export function relTime(ts) {
  if (!ts) return 'never';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
