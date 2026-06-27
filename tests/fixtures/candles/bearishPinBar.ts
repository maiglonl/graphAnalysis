import type { Candle } from '#shared/types/market';
import { bullishTrendCandles, withLastCandle } from './factories';

export function bearishPinBarCandles(): Candle[] {
  return withLastCandle(
    bullishTrendCandles(59),
    { time: 60, open: 160.2, high: 170, low: 160, close: 160, volume: 1500 },
  );
}

export function earlyBearishPinBarCandles(): Candle[] {
  return withLastCandle(
    bullishTrendCandles(10),
    { time: 11, open: 160.2, high: 170, low: 160, close: 160, volume: 1500 },
  );
}
