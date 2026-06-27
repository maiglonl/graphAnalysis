import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum, type Candle } from '#shared/types/market';
import { BearishEngulfingDetector } from '#shared/utils/detectors/candle/bearishEngulfing';
import { BullishEngulfingDetector } from '#shared/utils/detectors/candle/bullishEngulfing';
import { ScanContext } from '#shared/utils/scanContext';

function bearishCandles(count: number): Candle[] {
  return Array.from({ length: count }, (_, index) => {
    const close = 200 - index;

    return {
      time: index + 1,
      open: close + 0.5,
      high: close + 1,
      low: close - 1,
      close,
      volume: 1000,
    };
  });
}

function bullishCandles(count: number): Candle[] {
  return Array.from({ length: count }, (_, index) => {
    const close = 100 + index;

    return {
      time: index + 1,
      open: close - 0.5,
      high: close + 1,
      low: close - 1,
      close,
      volume: 1000,
    };
  });
}

describe('Engulfing detectors', () => {
  it('detects bullish engulfing after a bearish trend', () => {
    const candles = [
      ...bearishCandles(58),
      { time: 59, open: 142, high: 143, low: 139.5, close: 140, volume: 1000 },
      { time: 60, open: 139.5, high: 143, low: 139, close: 142.5, volume: 1500 },
    ];

    const signals = new BullishEngulfingDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.BullishEngulfing,
      direction: PatternDirectionEnum.Bullish,
      entry: 143,
      stop: 139,
    });
  });

  it('detects bearish engulfing after a bullish trend', () => {
    const candles = [
      ...bullishCandles(58),
      { time: 59, open: 158, high: 160.5, low: 157, close: 160, volume: 1000 },
      { time: 60, open: 160.5, high: 161, low: 157, close: 157.5, volume: 1500 },
    ];

    const signals = new BearishEngulfingDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.BearishEngulfing,
      direction: PatternDirectionEnum.Bearish,
      entry: 157,
      stop: 161,
    });
  });
});
