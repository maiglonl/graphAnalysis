import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { MomentumBreakoutDetector } from '#shared/utils/detectors/momentum/momentumBreakout';
import { MomentumExhaustionDetector } from '#shared/utils/detectors/momentum/momentumExhaustion';
import { ScanContext } from '#shared/utils/scanContext';
import { bearishTrendCandles, bullishTrendCandles, flatCandles, withLastCandle } from '../../../fixtures/candles/factories';

// After 60 rising candles, close=159, prior 12-bar high ≈ 158.
// One more candle at 165 breaks above the range → bullish breakout.
// For bearish breakout: 60 falling candles (close=141) then a drop to 135 (below 12-bar low≈142).

describe('momentum breakout detector', () => {
  it('detects bullish momentum breakout', () => {
    const signals = new MomentumBreakoutDetector().detect(new ScanContext(withLastCandle(
      bullishTrendCandles(60),
      { time: 61, open: 159, high: 166, low: 158, close: 165, volume: 1000 },
    )));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.MomentumBreakout,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('detects bearish momentum breakout', () => {
    const signals = new MomentumBreakoutDetector().detect(new ScanContext(withLastCandle(
      bearishTrendCandles(60),
      { time: 61, open: 141, high: 142, low: 134, close: 135, volume: 1000 },
    )));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.MomentumBreakout,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('does not fire in flat range', () => {
    const signals = new MomentumBreakoutDetector().detect(new ScanContext(flatCandles(60)));
    expect(signals).toHaveLength(0);
  });

  it('does not fire with fewer candles than lookback', () => {
    const signals = new MomentumBreakoutDetector().detect(new ScanContext(flatCandles(5)));
    expect(signals).toHaveLength(0);
  });
});

// After 80 rising candles RSI is well above 75 (all gains). A bearish candle (close < open)
// with RSI ≥ 75 triggers bearish exhaustion.
// After 80 falling candles RSI is near 0 (all losses). A bullish candle triggers bullish exhaustion.

describe('momentum exhaustion detector', () => {
  it('detects bearish exhaustion after extended uptrend', () => {
    const signals = new MomentumExhaustionDetector().detect(new ScanContext(withLastCandle(
      bullishTrendCandles(80),
      { time: 81, open: 182, high: 183, low: 178, close: 179, volume: 1000 },
    )));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.MomentumExhaustion,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('detects bullish exhaustion after extended downtrend', () => {
    const signals = new MomentumExhaustionDetector().detect(new ScanContext(withLastCandle(
      bearishTrendCandles(80),
      { time: 81, open: 118, high: 123, low: 117, close: 122, volume: 1000 },
    )));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.MomentumExhaustion,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('does not fire in flat/neutral market', () => {
    const signals = new MomentumExhaustionDetector().detect(new ScanContext(flatCandles(30)));
    expect(signals).toHaveLength(0);
  });
});
