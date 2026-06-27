import { describe, expect, it } from 'vitest';
import {
  WATCHLIST_MAX_ITEMS,
  addWatchlistSymbol,
  normalizeWatchlistSymbol,
  removeWatchlistSymbol,
} from '~/utils/watchlist';

describe('watchlist utils', () => {
  it('normalizes symbols', () => {
    expect(normalizeWatchlistSymbol(' btc-usdt ')).toBe('BTCUSDT');
  });

  it('adds symbol to the beginning without duplicates', () => {
    expect(addWatchlistSymbol(['ETHUSDT', 'BTCUSDT'], 'btc-usdt')).toEqual(['BTCUSDT', 'ETHUSDT']);
  });

  it('ignores empty symbols', () => {
    expect(addWatchlistSymbol(['BTCUSDT'], '---')).toEqual(['BTCUSDT']);
  });

  it('limits watchlist size', () => {
    const items = Array.from({ length: WATCHLIST_MAX_ITEMS }, (_, index) => `A${index}`);

    expect(addWatchlistSymbol(items, 'BTCUSDT')).toHaveLength(WATCHLIST_MAX_ITEMS);
    expect(addWatchlistSymbol(items, 'BTCUSDT')[0]).toBe('BTCUSDT');
  });

  it('removes symbol from list', () => {
    expect(removeWatchlistSymbol(['BTCUSDT', 'ETHUSDT'], 'btc-usdt')).toEqual(['ETHUSDT']);
  });
});
