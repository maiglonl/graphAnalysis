import type { Candle } from '#shared/types/market';
import { flatCandles, withLastCandle } from './factories';

export function dojiCandles(): Candle[] {
  return withLastCandle(
    flatCandles(59),
    { time: 60, open: 100, high: 110, low: 90, close: 100.5, volume: 1000 },
  );
}

export function nonDojiCandles(): Candle[] {
  return withLastCandle(
    flatCandles(59),
    { time: 60, open: 100, high: 110, low: 90, close: 105, volume: 1000 },
  );
}
