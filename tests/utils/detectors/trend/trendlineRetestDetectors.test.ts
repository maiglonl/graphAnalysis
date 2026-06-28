import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { TrendlineBreakUpDetector } from '#shared/utils/detectors/trend/trendlineBreakUp';
import { TrendlineBreakDownDetector } from '#shared/utils/detectors/trend/trendlineBreakDown';
import { RetestSupportDetector } from '#shared/utils/detectors/trend/retestSupport';
import { RetestResistanceDetector } from '#shared/utils/detectors/trend/retestResistance';
import { ScanContext } from '#shared/utils/scanContext';
import { flatCandles, withLastCandle } from '../../../fixtures/candles/factories';

describe('trendline and retest detectors', () => {
  // flatCandles(20, 100) produces high=105 for all 20 candles.
  // The lookback window (12 candles) has resistanceHigh=105.
  // A close of 130 breaks above it.
  it('detects trendline break up', () => {
    const signals = new TrendlineBreakUpDetector().detect(new ScanContext(withLastCandle(
      flatCandles(20, 100),
      { time: 21, open: 128, high: 132, low: 127, close: 130, volume: 1200 },
    )));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.TrendlineBreakUp,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  // flatCandles(20, 100) produces low=95 for all 20 candles.
  // The lookback window (12 candles) has supportLow=95.
  // A close of 70 breaks below it.
  it('detects trendline break down', () => {
    const signals = new TrendlineBreakDownDetector().detect(new ScanContext(withLastCandle(
      flatCandles(20, 100),
      { time: 21, open: 72, high: 73, low: 68, close: 70, volume: 1200 },
    )));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.TrendlineBreakDown,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  // Sequence builds a clear swing low at index 31 (low=88):
  //   isSwingLow checks that all neighbours within ±2 have strictly higher lows.
  //   Indices 29-30 have lows 98 and 89; indices 32-33 have lows 91 and 94 — all > 88.
  // getSwingLows(candles, lastIndex=43, limit=1) walks back from 41 and finds index 31.
  // The retest candle (low=88) satisfies: low <= support(88) + tolerance(88*0.006=0.528).
  it('detects retest support', () => {
    const base = [
      // Flat candles before the dip
      ...Array.from({ length: 30 }, (_, i) => ({
        time: i + 1, open: 100, high: 102, low: 98, close: 100, volume: 1000,
      })),
      // Descend into swing low
      { time: 31, open: 95, high: 97, low: 89, close: 93, volume: 1000 },
      { time: 32, open: 90, high: 92, low: 88, close: 91, volume: 1000 }, // swing low candle (index 31)
      { time: 33, open: 93, high: 95, low: 91, close: 94, volume: 1000 },
      // Recovery candles
      ...Array.from({ length: 10 }, (_, i) => ({
        time: 34 + i, open: 96, high: 98, low: 94, close: 97, volume: 1000,
      })),
    ];

    // Retest candle approaches the swing low (88) and closes bullish
    const signals = new RetestSupportDetector().detect(new ScanContext(withLastCandle(base, {
      time: 45, open: 91, high: 97, low: 88, close: 95, volume: 1200,
    })));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.RetestSupport,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  // Sequence builds a clear swing high at index 31 (high=113):
  //   Indices 29-30 have highs 102 and 111; indices 32-33 have highs 111 and 106 — all < 113.
  // getSwingHighs(candles, lastIndex=43, limit=1) walks back from 41 and finds index 31.
  // The retest candle (high=114) satisfies: high >= resistance(113) - tolerance(113*0.006=0.678).
  it('detects retest resistance', () => {
    const base = [
      // Flat candles before the spike
      ...Array.from({ length: 30 }, (_, i) => ({
        time: i + 1, open: 100, high: 102, low: 98, close: 100, volume: 1000,
      })),
      // Rise into swing high
      { time: 31, open: 105, high: 111, low: 103, close: 107, volume: 1000 },
      { time: 32, open: 109, high: 113, low: 107, close: 110, volume: 1000 }, // swing high candle (index 31)
      { time: 33, open: 108, high: 111, low: 106, close: 108, volume: 1000 },
      // Pullback candles
      ...Array.from({ length: 10 }, (_, i) => ({
        time: 34 + i, open: 104, high: 106, low: 102, close: 103, volume: 1000,
      })),
    ];

    // Retest candle approaches the swing high (113) and closes bearish
    const signals = new RetestResistanceDetector().detect(new ScanContext(withLastCandle(base, {
      time: 45, open: 111, high: 114, low: 108, close: 109, volume: 1200,
    })));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.RetestResistance,
      direction: PatternDirectionEnum.Bearish,
    });
  });
});
