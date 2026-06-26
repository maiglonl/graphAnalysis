import { describe, expect, it } from 'vitest';
import { atr, ema, relativeVolume, sma } from '#shared/utils/indicators';

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
});
