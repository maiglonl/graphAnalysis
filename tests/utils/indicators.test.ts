import { describe, expect, it } from 'vitest';
import { atr, ema, macd, relativeVolume, rsi, sma, stochastic } from '#shared/utils/indicators';

const candles = [
  { time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100 },
  { time: 2, open: 11, high: 13, low: 10, close: 12, volume: 100 },
  { time: 3, open: 12, high: 14, low: 11, close: 13, volume: 200 },
];

describe('indicators', () => {
  it('calculates SMA', () => {
    expect(sma([1, 2, 3, 4], 2)).toEqual([NaN, 1.5, 2.5, 3.5]);
  });

  it('calculates EMA with same length as input', () => {
    expect(ema([1, 2, 3], 2)).toHaveLength(3);
  });

  it('calculates ATR', () => {
    expect(atr(candles, 2)).toHaveLength(candles.length);
  });

  it('calculates relative volume', () => {
    expect(relativeVolume(candles, 2)).toEqual([NaN, 1, 1.3333333333333333]);
  });

  it('rsi returns array of same length with finite values after warmup', () => {
    const closes = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i) * 5);
    const result = rsi(closes);
    expect(result).toHaveLength(closes.length);
    expect(result.slice(14).every(Number.isFinite)).toBe(true);
  });

  it('rsi returns NaN before warmup period', () => {
    const closes = Array.from({ length: 20 }, () => 100);
    const result = rsi(closes);
    expect(Number.isNaN(result[13])).toBe(true);
    expect(Number.isFinite(result[14])).toBe(true);
  });

  it('rsi is 100 when all changes are gains', () => {
    const closes = [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];
    const result = rsi(closes);
    expect(result[14]).toBe(100);
  });

  it('rsi is 0 when all changes are losses', () => {
    const closes = [114, 113, 112, 111, 110, 109, 108, 107, 106, 105, 104, 103, 102, 101, 100];
    const result = rsi(closes);
    expect(result[14]).toBe(0);
  });

  it('macd returns arrays of same length as input', () => {
    const closes = Array.from({ length: 50 }, (_, i) => 100 + i);
    const result = macd(closes);
    expect(result.macd).toHaveLength(closes.length);
    expect(result.signal).toHaveLength(closes.length);
    expect(result.histogram).toHaveLength(closes.length);
  });

  it('macd histogram equals macd minus signal', () => {
    const closes = Array.from({ length: 50 }, (_, i) => 100 + i * 0.5);
    const result = macd(closes);
    result.histogram.forEach((h, i) => {
      const expected = result.macd[i]! - result.signal[i]!;
      if (Number.isFinite(h) && Number.isFinite(expected)) {
        expect(h).toBeCloseTo(expected, 8);
      }
    });
  });

  it('stochastic returns k and d arrays of same length as candles', () => {
    const result = stochastic(candles, 2, 2);
    expect(result.k).toHaveLength(candles.length);
    expect(result.d).toHaveLength(candles.length);
  });

  it('stochastic k is between 0 and 100', () => {
    const testCandles = Array.from({ length: 20 }, (_, i) => ({
      time: i + 1, open: 100, high: 105 + Math.sin(i) * 3, low: 95 - Math.sin(i) * 3,
      close: 100 + Math.sin(i) * 4, volume: 1000,
    }));
    const result = stochastic(testCandles);
    result.k.filter(Number.isFinite).forEach((k) => {
      expect(k).toBeGreaterThanOrEqual(0);
      expect(k).toBeLessThanOrEqual(100);
    });
  });
});
