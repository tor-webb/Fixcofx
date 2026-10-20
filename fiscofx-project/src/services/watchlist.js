const KEY = 'fiscofx:watchlist:v1';

export function loadWatchlist() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWatchlist(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {}
}

export function isWatched(id) {
  return loadWatchlist().includes(id);
}

export function toggleWatched(id) {
  const cur = new Set(loadWatchlist());
  if (cur.has(id)) cur.delete(id);
  else cur.add(id);
  const next = [...cur];
  saveWatchlist(next);
  return next;
}
