import type { Candle } from "#shared/types/market";
import { atr, ema, relativeVolume } from "#shared/utils/indicators";

export type ScanContext = {
  candles: Candle[];
  index: number;
  closes: number[];
  ema20: number[];
  ema50: number[];
  atr14: number[];
  relativeVolume20: number[];
};

export function createScanContext(candles: Candle[]): ScanContext {
  const closes = candles.map((candle) => candle.close);

  return {
    candles,
    index: candles.length - 1,
    closes,
    ema20: ema(closes, 20),
    ema50: ema(closes, 50),
    atr14: atr(candles, 14),
    relativeVolume20: relativeVolume(candles, 20),
  };
}
