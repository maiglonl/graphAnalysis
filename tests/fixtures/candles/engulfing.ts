import type { Candle } from '#shared/types/market';
import { bearishTrendCandles, bullishTrendCandles } from './factories';

export function bullishEngulfingCandles(): Candle[] {
  return [
    ...bearishTrendCandles(58),
    { time: 59, open: 142, high: 143, low: 139.5, close: 140, volume: 1000 },
    { time: 60, open: 139.5, high: 143, low: 139, close: 142.5, volume: 1500 },
  ];
}

export function bearishEngulfingCandles(): Candle[] {
  return [
    ...bullishTrendCandles(58),
    { time: 59, open: 158, high: 160.5, low: 157, close: 160, volume: 1000 },
    { time: 60, open: 160.5, high: 161, low: 157, close: 157.5, volume: 1500 },
  ];
}
