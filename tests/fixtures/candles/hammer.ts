import type { Candle } from '#shared/types/market';
import { bearishTrendCandles, withLastCandle } from './factories';

export function hammerCandles(): Candle[] {
  return withLastCandle(
    bearishTrendCandles(59),
    { time: 60, open: 138, high: 140.4, low: 130, close: 140, volume: 1500 },
  );
}
