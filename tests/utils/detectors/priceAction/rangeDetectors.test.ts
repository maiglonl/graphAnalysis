import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { RectangleBreakoutUpDetector } from '#shared/utils/detectors/priceAction/rectangleBreakoutUp';
import { RectangleBreakoutDownDetector } from '#shared/utils/detectors/priceAction/rectangleBreakoutDown';
import { RangeRejectionHighDetector } from '#shared/utils/detectors/priceAction/rangeRejectionHigh';
import { RangeRejectionLowDetector } from '#shared/utils/detectors/priceAction/rangeRejectionLow';
import { ScanContext } from '#shared/utils/scanContext';
import type { Candle } from '#shared/types/market';

// 12 flat candles: high=106, low=100. Height = 6, pct = 6/103 ≈ 5.8% < 8% ✓
function flatRangeCandles(): Candle[] {
  return Array.from({ length: 12 }, (_, i) => ({
    time: i + 1,
    open: 103,
    high: 106,
    low: 100,
    close: 103,
    volume: 1000,
  }));
}

describe('RectangleBreakoutUpDetector', () => {
  it('detects breakout above range', () => {
    // Breakout: close = 108 > rangeHigh(106) + threshold(106*0.002=0.212)
    const candles = [
      ...flatRangeCandles(),
      { time: 13, open: 106.5, high: 109, low: 106.2, close: 108, volume: 1200 },
    ];
    const signals = new RectangleBreakoutUpDetector().detect(new ScanContext(candles));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.RectangleBreakoutUp,
      direction: PatternDirectionEnum.Bullish,
    });
    expect(signals[0]?.targets?.length).toBeGreaterThan(0);
  });

  it('ignores when close stays inside range', () => {
    const candles = [
      ...flatRangeCandles(),
      { time: 13, open: 102, high: 105, low: 101, close: 103, volume: 1000 },
    ];
    const signals = new RectangleBreakoutUpDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(0);
  });
});

describe('RectangleBreakoutDownDetector', () => {
  it('detects breakout below range', () => {
    // Breakout: close = 98 < rangeLow(100) - threshold(100*0.002=0.2)
    const candles = [
      ...flatRangeCandles(),
      { time: 13, open: 99.5, high: 100, low: 97, close: 98, volume: 1200 },
    ];
    const signals = new RectangleBreakoutDownDetector().detect(new ScanContext(candles));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.RectangleBreakoutDown,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('ignores when close stays inside range', () => {
    const candles = [
      ...flatRangeCandles(),
      { time: 13, open: 102, high: 105, low: 101, close: 103, volume: 1000 },
    ];
    const signals = new RectangleBreakoutDownDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(0);
  });
});

describe('RangeRejectionHighDetector', () => {
  it('detects bearish rejection near range high', () => {
    // high=106.5 >= rangeHigh(106) - tolerance(103*0.01=1.03) = 104.97 ✓
    // close=103 < rangeHigh(106) ✓
    const candles = [
      ...flatRangeCandles(),
      { time: 13, open: 104, high: 106.5, low: 102, close: 103, volume: 1200 },
    ];
    const signals = new RangeRejectionHighDetector().detect(new ScanContext(candles));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.RangeRejectionHigh,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('ignores when high does not approach range high', () => {
    const candles = [
      ...flatRangeCandles(),
      { time: 13, open: 101, high: 103, low: 100.5, close: 102, volume: 1000 },
    ];
    const signals = new RangeRejectionHighDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(0);
  });
});

describe('RangeRejectionLowDetector', () => {
  it('detects bullish rejection near range low', () => {
    // low=99.5 <= rangeLow(100) + tolerance(103*0.01=1.03) = 101.03 ✓
    // close=103 > rangeLow(100) ✓
    const candles = [
      ...flatRangeCandles(),
      { time: 13, open: 102, high: 105, low: 99.5, close: 103, volume: 1200 },
    ];
    const signals = new RangeRejectionLowDetector().detect(new ScanContext(candles));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.RangeRejectionLow,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('ignores when low does not approach range low', () => {
    const candles = [
      ...flatRangeCandles(),
      { time: 13, open: 103, high: 106, low: 102.5, close: 104, volume: 1000 },
    ];
    const signals = new RangeRejectionLowDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(0);
  });
});
