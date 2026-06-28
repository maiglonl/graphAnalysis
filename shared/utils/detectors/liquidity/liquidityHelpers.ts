import type { Candle } from '#shared/types/market';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';

export type LiquidityRange = {
  high: number;
  low: number;
};

export function getLiquidityRange(candles: Candle[], currentIndex: number): LiquidityRange | null {
  const lookback = EXTRA_THRESHOLDS.liquidityLookback;
  if (currentIndex < lookback) return null;
  const previous = candles.slice(currentIndex - lookback, currentIndex);
  if (previous.length < lookback) return null;
  return {
    high: Math.max(...previous.map((candle) => candle.high)),
    low: Math.min(...previous.map((candle) => candle.low)),
  };
}

export function areNear(a: number, b: number): boolean {
  const base = Math.max(Math.abs(a), Math.abs(b));
  if (base <= 0) return false;
  return Math.abs(a - b) / base <= EXTRA_THRESHOLDS.liquidityTolerancePct;
}
