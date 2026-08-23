const NAMESPACE = "ledger:";

export function loadJSON(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(NAMESPACE + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error("storage read failed", key, e);
    return fallback;
  }
}

export function saveJSON(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
  } catch (e) {
    console.error("storage write failed", key, e);
  }
}
