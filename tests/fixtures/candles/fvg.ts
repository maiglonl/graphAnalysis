import type { Candle } from '#shared/types/market';
import { narrowFlatCandles } from './factories';

export function bullishFvgCandles(): Candle[] {
  return [
    ...narrowFlatCandles(57),
    { time: 58, open: 98, high: 100, low: 97, close: 99, volume: 1000 },
    { time: 59, open: 100, high: 108, low: 99, close: 107, volume: 1500 },
    { time: 60, open: 107, high: 110, low: 105, close: 109, volume: 1000 },
  ];
}

export function bearishFvgCandles(): Candle[] {
  return [
    ...narrowFlatCandles(57),
    { time: 58, open: 102, high: 103, low: 100, close: 101, volume: 1000 },
    { time: 59, open: 100, high: 101, low: 92, close: 93, volume: 1500 },
    { time: 60, open: 93, high: 95, low: 90, close: 91, volume: 1000 },
  ];
}

export function unconfirmedBullishFvgCandles(): Candle[] {
  return [
    ...narrowFlatCandles(57),
    { time: 58, open: 98, high: 100, low: 97, close: 99, volume: 1000 },
    { time: 59, open: 107, high: 108, low: 99, close: 100, volume: 1500 },
    { time: 60, open: 107, high: 110, low: 105, close: 109, volume: 1000 },
  ];
}
