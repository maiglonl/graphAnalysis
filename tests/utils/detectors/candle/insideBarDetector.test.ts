import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum, type Candle } from '#shared/types/market';
import { InsideBarDetector } from '#shared/utils/detectors/candle/insideBar';
import { ScanContext } from '#shared/utils/scanContext';

function baseCandles(count: number): Candle[] {
  return Array.from({ length: count }, (_, index) => ({
    time: index + 1,
    open: 100,
    high: 105,
    low: 95,
    close: 100,
    volume: 1000,
  }));
}

describe('InsideBarDetector', () => {
  it('detects an inside bar contained within the mother candle', () => {
    const candles = [
      ...baseCandles(58),
      { time: 59, open: 100, high: 110, low: 90, close: 105, volume: 1000 },
      { time: 60, open: 102, high: 108, low: 92, close: 104, volume: 1000 },
    ];

    const signals = new InsideBarDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.InsideBar,
      direction: PatternDirectionEnum.Neutral,
      entry: 110,
      stop: 90,
    });
  });

  it('ignores candles that break the mother candle range', () => {
    const candles = [
      ...baseCandles(58),
      { time: 59, open: 100, high: 110, low: 90, close: 105, volume: 1000 },
      { time: 60, open: 102, high: 111, low: 92, close: 104, volume: 1000 },
    ];

    const signals = new InsideBarDetector().detect(new ScanContext(candles));

    expect(signals).toEqual([]);
  });
});
