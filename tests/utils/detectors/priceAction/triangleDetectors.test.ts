import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { AscendingTriangleDetector } from '#shared/utils/detectors/priceAction/ascendingTriangle';
import { DescendingTriangleDetector } from '#shared/utils/detectors/priceAction/descendingTriangle';
import { SymmetricalTriangleDetector } from '#shared/utils/detectors/priceAction/symmetricalTriangle';
import { ScanContext } from '#shared/utils/scanContext';
import type { Candle } from '#shared/types/market';

// 12 candles: flat highs at 106, ascending lows 97→102.5
function ascendingTriangleLookback(): Candle[] {
  const lows = [97, 97.5, 98, 98.5, 99, 99.5, 100, 100.5, 101, 101.5, 102, 102.5];
  return lows.map((low, i) => ({
    time: i + 1, open: low + 3, high: 106, low, close: low + 3, volume: 1000,
  }));
}

// 12 candles: flat lows at 100, descending highs 110→104.5
function descendingTriangleLookback(): Candle[] {
  const highs = [110, 109.5, 109, 108.5, 108, 107.5, 107, 106.5, 106, 105.5, 105, 104.5];
  return highs.map((high, i) => ({
    time: i + 1, open: high - 4, high, low: 100, close: high - 4, volume: 1000,
  }));
}

// 12 candles: highs descend 110→104.5, lows ascend 97→102.5
function symmetricalTriangleLookback(): Candle[] {
  const highs = [110, 109.5, 109, 108.5, 108, 107.5, 107, 106.5, 106, 105.5, 105, 104.5];
  const lows = [97, 97.5, 98, 98.5, 99, 99.5, 100, 100.5, 101, 101.5, 102, 102.5];
  return highs.map((high, i) => ({
    time: i + 1, open: 103, high, low: lows[i]!, close: 103, volume: 1000,
  }));
}

describe('AscendingTriangleDetector', () => {
  it('detects bullish breakout above flat resistance', () => {
    const candles = [
      ...ascendingTriangleLookback(),
      { time: 13, open: 107, high: 110, low: 106.5, close: 109, volume: 1200 },
    ];
    const signals = new AscendingTriangleDetector().detect(new ScanContext(candles));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.AscendingTriangle,
      direction: PatternDirectionEnum.Bullish,
    });
    expect(signals[0]?.targets?.length).toBeGreaterThan(0);
  });

  it('ignores when close does not break above resistance', () => {
    const candles = [
      ...ascendingTriangleLookback(),
      { time: 13, open: 104, high: 106, low: 103, close: 105, volume: 1000 },
    ];
    const signals = new AscendingTriangleDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(0);
  });
});

describe('DescendingTriangleDetector', () => {
  it('detects bearish breakout below flat support', () => {
    const candles = [
      ...descendingTriangleLookback(),
      { time: 13, open: 99.5, high: 100, low: 97, close: 98, volume: 1200 },
    ];
    const signals = new DescendingTriangleDetector().detect(new ScanContext(candles));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.DescendingTriangle,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('ignores when close does not break below support', () => {
    const candles = [
      ...descendingTriangleLookback(),
      { time: 13, open: 102, high: 104, low: 100.5, close: 102, volume: 1000 },
    ];
    const signals = new DescendingTriangleDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(0);
  });
});

describe('SymmetricalTriangleDetector', () => {
  it('detects bullish breakout above triangle', () => {
    const candles = [
      ...symmetricalTriangleLookback(),
      { time: 13, open: 111, high: 115, low: 110.5, close: 113, volume: 1200 },
    ];
    const signals = new SymmetricalTriangleDetector().detect(new ScanContext(candles));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.SymmetricalTriangle,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('detects bearish breakout below triangle', () => {
    const candles = [
      ...symmetricalTriangleLookback(),
      { time: 13, open: 96.5, high: 97, low: 93, close: 94, volume: 1200 },
    ];
    const signals = new SymmetricalTriangleDetector().detect(new ScanContext(candles));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.SymmetricalTriangle,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('ignores when close stays inside triangle', () => {
    const candles = [
      ...symmetricalTriangleLookback(),
      { time: 13, open: 103, high: 104, low: 102, close: 103, volume: 1000 },
    ];
    const signals = new SymmetricalTriangleDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(0);
  });
});
