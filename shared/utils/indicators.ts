import type { Candle } from '../types/market';
import { StructureTrendEnum } from '../types/market';
import { SCANNER } from './detectors/constants';

export function sma(values: number[], period: number): number[] {
  return values.map((_, index) => {
    if (index < period - 1) return NaN;
    const slice = values.slice(index - period + 1, index + 1);
    return slice.reduce((sum, value) => sum + value, 0) / period;
  });
}

export function ema(values: number[], period: number): number[] {
  const multiplier = 2 / (period + 1);
  const result: number[] = [];
  values.forEach((value, index) => {
    if (index === 0) { result.push(value); return; }
    const previous = result[index - 1] ?? value;
    result.push((value - previous) * multiplier + previous);
  });
  return result;
}

export function atr(candles: Candle[], period = 14): number[] {
  const trueRanges = candles.map((candle, index) => {
    if (index === 0) return candle.high - candle.low;
    const previousClose = candles[index - 1]!.close;
    return Math.max(
      candle.high - candle.low,
      Math.abs(candle.high - previousClose),
      Math.abs(candle.low - previousClose),
    );
  });
  return sma(trueRanges, period);
}

export function relativeVolume(candles: Candle[], period = 20): number[] {
  const volumes = candles.map((candle) => candle.volume);
  const avgVolumes = sma(volumes, period);
  return volumes.map((volume, index) => {
    const avg = avgVolumes[index];
    if (!avg || Number.isNaN(avg)) return NaN;
    return volume / avg;
  });
}

/**
 * Retorna a tendência a partir de EMAs pré-computadas.
 * Use esta função quando EMAs já estiverem disponíveis (ex: ScanContext).
 */
export function getTrend(
  index: number,
  close: number,
  ema20: number[],
  ema50: number[],
): StructureTrendEnum {
  if (index < SCANNER.minCandles) return StructureTrendEnum.Neutral;
  const e20 = ema20[index];
  const e50 = ema50[index];
  if (e20 === undefined || e50 === undefined) return StructureTrendEnum.Neutral;
  if (close > e20 && e20 > e50) return StructureTrendEnum.Bullish;
  if (close < e20 && e20 < e50) return StructureTrendEnum.Bearish;
  return StructureTrendEnum.Neutral;
}

export function isUptrend(candles: Candle[], index: number): boolean {
  if (index < SCANNER.minCandles) return false;
  const closes = candles.map((c) => c.close);
  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);
  return getTrend(index, candles[index]!.close, ema20, ema50) === StructureTrendEnum.Bullish;
}

export function isDowntrend(candles: Candle[], index: number): boolean {
  if (index < SCANNER.minCandles) return false;
  const closes = candles.map((c) => c.close);
  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);
  return getTrend(index, candles[index]!.close, ema20, ema50) === StructureTrendEnum.Bearish;
}

export function isSwingHigh(candles: Candle[], index: number, left = 2, right = 2): boolean {
  if (index < left || index + right >= candles.length) return false;
  const current = candles[index]!.high;
  for (let i = index - left; i <= index + right; i++) {
    if (i === index) continue;
    if (candles[i]!.high >= current) return false;
  }
  return true;
}

export function isSwingLow(candles: Candle[], index: number, left = 2, right = 2): boolean {
  if (index < left || index + right >= candles.length) return false;
  const current = candles[index]!.low;
  for (let i = index - left; i <= index + right; i++) {
    if (i === index) continue;
    if (candles[i]!.low <= current) return false;
  }
  return true;
}

export function getLastSwingHigh(candles: Candle[], beforeIndex: number) {
  for (let i = beforeIndex - 2; i >= 2; i--) {
    if (isSwingHigh(candles, i)) return { index: i, price: candles[i]!.high };
  }
  return null;
}

export function getLastSwingLow(candles: Candle[], beforeIndex: number) {
  for (let i = beforeIndex - 2; i >= 2; i--) {
    if (isSwingLow(candles, i)) return { index: i, price: candles[i]!.low };
  }
  return null;
}
