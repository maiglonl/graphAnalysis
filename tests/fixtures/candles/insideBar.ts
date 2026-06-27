import type { Candle } from '#shared/types/market';
import { flatCandles } from './factories';

export function insideBarCandles(): Candle[] {
  return [
    ...flatCandles(58),
    { time: 59, open: 100, high: 110, low: 90, close: 105, volume: 1000 },
    { time: 60, open: 102, high: 108, low: 92, close: 104, volume: 1000 },
  ];
}

export function outsideMotherRangeCandles(): Candle[] {
  return [
    ...flatCandles(58),
    { time: 59, open: 100, high: 110, low: 90, close: 105, volume: 1000 },
    { time: 60, open: 102, high: 111, low: 92, close: 104, volume: 1000 },
  ];
}
