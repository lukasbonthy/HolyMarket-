export function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
export function formatPercent(value) { return `${Math.round(clamp(Number(value) || 0, 0, 1) * 100)}%`; }
export function formatNumber(value) { return Math.round(Number(value) || 0).toLocaleString('en-US'); }
export function payoutFor(stake, probability) {
  const s = Number(stake); const p = Number(probability);
  if (!Number.isFinite(s) || !Number.isFinite(p) || s <= 0 || p <= 0 || p > 1) return 0;
  return Math.round((s / p) * 100) / 100;
}
export function filterMarkets(markets, query='', topic='All') {
  const q = String(query).trim().toLowerCase();
  const t = String(topic).trim().toLowerCase();
  return markets.filter(m => {
    const hay = [m.title,m.category,m.reference,m.tag,...(m.outcomes||[]).map(o=>o.label)].filter(Boolean).join(' ').toLowerCase();
    return (t === 'all' || hay.includes(t)) && (!q || hay.includes(q));
  });
}
export function hashRoute(hash='') {
  const raw = hash.replace(/^#/, '') || '/';
  if (raw === '/markets' || raw.startsWith('/markets?')) return {name:'markets'};
  const event = raw.match(/^\/event\/([^/?#]+)/);
  if (event) return {name:'event', id:decodeURIComponent(event[1])};
  return {name:'home'};
}
