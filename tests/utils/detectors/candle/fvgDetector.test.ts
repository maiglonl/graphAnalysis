import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum, type Candle } from '#shared/types/market';
import { BearishFvgDetector } from '#shared/utils/detectors/candle/bearishFvg';
import { BullishFvgDetector } from '#shared/utils/detectors/candle/bullishFvg';
import { ScanContext } from '#shared/utils/scanContext';

function baseCandles(count: number): Candle[] {
  return Array.from({ length: count }, (_, index) => ({
    time: index + 1,
    open: 100,
    high: 101,
    low: 99,
    close: 100,
    volume: 1000,
  }));
}

describe('FVG detectors', () => {
  it('detects bullish FVG between first and third candles', () => {
    const candles = [
      ...baseCandles(57),
      { time: 58, open: 98, high: 100, low: 97, close: 99, volume: 1000 },
      { time: 59, open: 100, high: 108, low: 99, close: 107, volume: 1500 },
      { time: 60, open: 107, high: 110, low: 105, close: 109, volume: 1000 },
    ];

    const signals = new BullishFvgDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.BullishFvg,
      direction: PatternDirectionEnum.Bullish,
      entry: 102.5,
      meta: {
        gapStart: 100,
        gapEnd: 105,
        gapSize: 5,
        fromTime: 58,
        toTime: 60,
      },
    });
  });

  it('detects bearish FVG between first and third candles', () => {
    const candles = [
      ...baseCandles(57),
      { time: 58, open: 102, high: 103, low: 100, close: 101, volume: 1000 },
      { time: 59, open: 100, high: 101, low: 92, close: 93, volume: 1500 },
      { time: 60, open: 93, high: 95, low: 90, close: 91, volume: 1000 },
    ];

    const signals = new BearishFvgDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.BearishFvg,
      direction: PatternDirectionEnum.Bearish,
      entry: 97.5,
      meta: {
        gapStart: 95,
        gapEnd: 100,
        gapSize: 5,
        fromTime: 58,
        toTime: 60,
      },
    });
  });

  it('ignores FVG when the middle candle does not confirm direction', () => {
    const candles = [
      ...baseCandles(57),
      { time: 58, open: 98, high: 100, low: 97, close: 99, volume: 1000 },
      { time: 59, open: 107, high: 108, low: 99, close: 100, volume: 1500 },
      { time: 60, open: 107, high: 110, low: 105, close: 109, volume: 1000 },
    ];

    const signals = new BullishFvgDetector().detect(new ScanContext(candles));

    expect(signals).toEqual([]);
  });
});
