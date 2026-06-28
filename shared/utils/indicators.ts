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

export function rsi(values: number[], period = 14): number[] {
  return values.map((_, index) => {
    if (index < period) return NaN;

    let gains = 0;
    let losses = 0;
    for (let i = index - period + 1; i <= index; i++) {
      const current = values[i] ?? 0;
      const previous = values[i - 1] ?? current;
      const change = current - previous;
      if (change >= 0) gains += change;
      else losses += Math.abs(change);
    }

    const averageGain = gains / period;
    const averageLoss = losses / period;
    if (averageLoss === 0) return 100;
    const relativeStrength = averageGain / averageLoss;
    return 100 - 100 / (1 + relativeStrength);
  });
}

export type MacdResult = {
  macd: number[];
  signal: number[];
  histogram: number[];
};

export function macd(values: number[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9): MacdResult {
  const fast = ema(values, fastPeriod);
  const slow = ema(values, slowPeriod);
  const macdLine = values.map((_, index) => {
    const fastValue = fast[index];
    const slowValue = slow[index];
    if (fastValue === undefined || slowValue === undefined) return NaN;
    return fastValue - slowValue;
  });
  const signal = ema(macdLine.map((value) => (Number.isFinite(value) ? value : 0)), signalPeriod);
  const histogram = macdLine.map((value, index) => {
    const signalValue = signal[index];
    if (!Number.isFinite(value) || signalValue === undefined) return NaN;
    return value - signalValue;
  });
  return { macd: macdLine, signal, histogram };
}

export type StochasticResult = {
  k: number[];
  d: number[];
};

export function stochastic(candles: Candle[], period = 14, signalPeriod = 3): StochasticResult {
  const k = candles.map((candle, index) => {
    if (index < period - 1) return NaN;
    const slice = candles.slice(index - period + 1, index + 1);
    const high = Math.max(...slice.map((c) => c.high));
    const low = Math.min(...slice.map((c) => c.low));
    if (high <= low) return 0;
    return ((candle.close - low) / (high - low)) * 100;
  });
  return { k, d: sma(k.map((value) => (Number.isFinite(value) ? value : 0)), signalPeriod) };
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
