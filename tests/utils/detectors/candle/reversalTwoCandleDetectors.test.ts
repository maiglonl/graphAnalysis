import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { DarkCloudCoverDetector } from '#shared/utils/detectors/candle/darkCloudCover';
import { PiercingLineDetector } from '#shared/utils/detectors/candle/piercingLine';
import { ScanContext } from '#shared/utils/scanContext';
import { bearishTrendCandles, bullishTrendCandles } from '../../../fixtures/candles/factories';

describe('two-candle reversal detectors', () => {
  // bearishTrendCandles(58): last close ≈ 142
  // Prior bearish: open=155, close=140, body=15, midpoint=147.5
  it('detects piercing line — bullish close above midpoint of prior bearish body', () => {
    const candles = [
      ...bearishTrendCandles(58),
      { time: 59, open: 155, high: 157, low: 138, close: 140, volume: 1500 },
      // opens at 137 (below prev.close=140), closes at 149 > midpoint 147.5
      { time: 60, open: 137, high: 150, low: 136, close: 149, volume: 1800 },
    ];
    const signals = new PiercingLineDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.PiercingLine,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('does not detect piercing line when close is at or below the midpoint', () => {
    const candles = [
      ...bearishTrendCandles(58),
      { time: 59, open: 155, high: 157, low: 138, close: 140, volume: 1500 },
      // closes at 147 — below midpoint 147.5
      { time: 60, open: 137, high: 148, low: 136, close: 147, volume: 1800 },
    ];
    expect(new PiercingLineDetector().detect(new ScanContext(candles))).toHaveLength(0);
  });

  // bullishTrendCandles(58): last close ≈ 158
  // Prior bullish: open=150, close=165, body=15, midpoint=157.5
  it('detects dark cloud cover — bearish close below midpoint of prior bullish body', () => {
    const candles = [
      ...bullishTrendCandles(58),
      { time: 59, open: 150, high: 167, low: 149, close: 165, volume: 1500 },
      // opens at 168 (above prev.close=165), closes at 156 < midpoint 157.5
      { time: 60, open: 168, high: 169, low: 154, close: 156, volume: 1800 },
    ];
    const signals = new DarkCloudCoverDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.DarkCloudCover,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('does not detect dark cloud cover when close is at or above the midpoint', () => {
    const candles = [
      ...bullishTrendCandles(58),
      { time: 59, open: 150, high: 167, low: 149, close: 165, volume: 1500 },
      // closes at 158 — above midpoint 157.5
      { time: 60, open: 168, high: 169, low: 156, close: 158, volume: 1800 },
    ];
    expect(new DarkCloudCoverDetector().detect(new ScanContext(candles))).toHaveLength(0);
  });
});
