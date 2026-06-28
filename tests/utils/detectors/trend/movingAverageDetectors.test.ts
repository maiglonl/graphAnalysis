import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { GoldenCrossDetector } from '#shared/utils/detectors/trend/goldenCross';
import { DeathCrossDetector } from '#shared/utils/detectors/trend/deathCross';
import { EmaBullishStackDetector } from '#shared/utils/detectors/trend/emaBullishStack';
import { EmaBearishStackDetector } from '#shared/utils/detectors/trend/emaBearishStack';
import { MaPullbackBullishDetector } from '#shared/utils/detectors/trend/maPullbackBullish';
import { MaPullbackBearishDetector } from '#shared/utils/detectors/trend/maPullbackBearish';
import { ScanContext } from '#shared/utils/scanContext';
import { bullishTrendCandles, bearishTrendCandles, flatCandles, withLastCandle } from '../../../fixtures/candles/factories';

describe('moving average detectors', () => {
  // After 60 flat candles at 100, ema20 = ema50 = 100 exactly.
  // A close of 101 pushes ema20 (mult=2/21) faster than ema50 (mult=2/51),
  // creating the cross in a single candle without requiring a scanning loop.
  it('detects golden cross', () => {
    const signals = new GoldenCrossDetector().detect(new ScanContext(withLastCandle(
      flatCandles(60, 100),
      { time: 61, open: 100, high: 102, low: 99, close: 101, volume: 1000 },
    )));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.GoldenCross,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  // After 60 flat candles at 100, ema20 = ema50 = 100 exactly.
  // A close of 99 drops ema20 faster than ema50, producing the death cross.
  it('detects death cross', () => {
    const signals = new DeathCrossDetector().detect(new ScanContext(withLastCandle(
      flatCandles(60, 100),
      { time: 61, open: 100, high: 100, low: 98, close: 99, volume: 1000 },
    )));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.DeathCross,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('detects ema bullish stack', () => {
    // 80 rising candles: close = 100..179, ema20 ≈ 169, ema50 ≈ 154 → close > ema20 > ema50
    const signals = new EmaBullishStackDetector().detect(new ScanContext(bullishTrendCandles(80)));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.EmaBullishStack,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('detects ema bearish stack', () => {
    // 80 falling candles: close = 200..121, ema20 ≈ 130, ema50 ≈ 145 → close < ema20 < ema50
    const signals = new EmaBearishStackDetector().detect(new ScanContext(bearishTrendCandles(80)));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.EmaBearishStack,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('detects ma pullback bullish', () => {
    // Establish uptrend: close > ema20 > ema50 after 80 rising candles.
    // Compute actual ema20[79] so the pullback candle's low lands within the 1% tolerance.
    const base = bullishTrendCandles(80);
    const ctx80 = new ScanContext(base);
    const ema20At79 = ctx80.ema20[79] ?? 0;

    const signals = new MaPullbackBullishDetector().detect(new ScanContext(withLastCandle(base, {
      time: 81,
      open: ema20At79 + 0.5,
      high: ema20At79 + 2,
      low: ema20At79,       // touches ema20 (within 1% tolerance at index 80)
      close: ema20At79 + 1, // bullish close above ema20
      volume: 1000,
    })));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.MaPullbackBullish,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('detects ma pullback bearish', () => {
    // Establish downtrend: close < ema20 < ema50 after 80 falling candles.
    // Compute actual ema20[79] so the pullback candle's high lands within the 1% tolerance.
    const base = bearishTrendCandles(80);
    const ctx80 = new ScanContext(base);
    const ema20At79 = ctx80.ema20[79] ?? 0;

    const signals = new MaPullbackBearishDetector().detect(new ScanContext(withLastCandle(base, {
      time: 81,
      open: ema20At79 - 0.5,
      high: ema20At79,       // touches ema20 from below (within 1% tolerance at index 80)
      low: ema20At79 - 2,
      close: ema20At79 - 1,  // bearish close below ema20
      volume: 1000,
    })));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.MaPullbackBearish,
      direction: PatternDirectionEnum.Bearish,
    });
  });
});
