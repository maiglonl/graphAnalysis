export const WATCHLIST_MAX_ITEMS = 20;

export function normalizeWatchlistSymbol(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function addWatchlistSymbol(items: string[], value: string): string[] {
  const symbol = normalizeWatchlistSymbol(value);

  if (!symbol) return items;

  const withoutDuplicate = items.filter((item) => item !== symbol);

  return [symbol, ...withoutDuplicate].slice(0, WATCHLIST_MAX_ITEMS);
}

export function removeWatchlistSymbol(items: string[], value: string): string[] {
  const symbol = normalizeWatchlistSymbol(value);

  return items.filter((item) => item !== symbol);
}
