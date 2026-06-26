import type { Candle } from '#shared/types/market';

export function round(value: number, decimals = 2) {
  return Number(value.toFixed(decimals));
}

export function candleParts(candle: Candle) {
  const range = candle.high - candle.low;
  const body = Math.abs(candle.close - candle.open);
  const upperShadow = candle.high - Math.max(candle.open, candle.close);
  const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
  return {
    range,
    body,
    upperShadow,
    lowerShadow,
    bodyPct: range > 0 ? body / range : 0,
    isBullish: candle.close > candle.open,
    isBearish: candle.close < candle.open,
    closePosition: range > 0 ? (candle.close - candle.low) / range : 0.5,
  };
}
