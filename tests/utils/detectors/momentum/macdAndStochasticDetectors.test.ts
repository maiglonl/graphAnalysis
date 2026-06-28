import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { MacdBullishCrossDetector } from '#shared/utils/detectors/momentum/macdBullishCross';
import { MacdBearishCrossDetector } from '#shared/utils/detectors/momentum/macdBearishCross';
import { StochasticOversoldReversalDetector } from '#shared/utils/detectors/momentum/stochasticOversoldReversal';
import { StochasticOverboughtReversalDetector } from '#shared/utils/detectors/momentum/stochasticOverboughtReversal';
import { ScanContext } from '#shared/utils/scanContext';
import { bearishTrendCandles, bullishTrendCandles, flatCandles, withLastCandle } from '../../../fixtures/candles/factories';

// After 60 flat candles at 100, EMA12 ≈ EMA26 ≈ 100, MACD ≈ 0, signal ≈ 0.
// One candle at 95 drives MACD negative (fast EMA drops faster than slow EMA).
// A subsequent jump to 107 makes MACD cross above the (still negative) signal.
const bullishCrossCandles = [
  ...flatCandles(60, 100),
  { time: 61, open: 95, high: 96, low: 94, close: 95, volume: 1000 },
  { time: 62, open: 105, high: 108, low: 104, close: 107, volume: 1000 },
];

// Symmetric: one candle at 105 drives MACD positive, then a drop to 93 creates bearish cross.
const bearishCrossCandles = [
  ...flatCandles(60, 100),
  { time: 61, open: 105, high: 106, low: 104, close: 105, volume: 1000 },
  { time: 62, open: 97, high: 98, low: 92, close: 93, volume: 1000 },
];

describe('MACD cross detectors', () => {
  it('detects bullish MACD cross', () => {
    const signals = new MacdBullishCrossDetector().detect(new ScanContext(bullishCrossCandles));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.MacdBullishCross,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('does not fire bullish cross on bearish candles', () => {
    const signals = new MacdBullishCrossDetector().detect(new ScanContext(bearishCrossCandles));
    expect(signals).toHaveLength(0);
  });

  it('detects bearish MACD cross', () => {
    const signals = new MacdBearishCrossDetector().detect(new ScanContext(bearishCrossCandles));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.MacdBearishCross,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('does not fire bearish cross on bullish candles', () => {
    const signals = new MacdBearishCrossDetector().detect(new ScanContext(bullishCrossCandles));
    expect(signals).toHaveLength(0);
  });
});

// bearishTrendCandles(50): close goes 200→151. Stochastic K stays ~6.67 (deeply oversold).
// A reversal candle with close=175 pushes K to ~88 while D is still ~37, triggering the cross.
describe('stochastic reversal detectors', () => {
  it('detects stochastic oversold reversal', () => {
    const signals = new StochasticOversoldReversalDetector().detect(
      new ScanContext(withLastCandle(
        bearishTrendCandles(50),
        { time: 51, open: 155, high: 176, low: 154, close: 175, volume: 1000 },
      )),
    );
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.StochasticOversoldReversal,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('does not fire oversold reversal in uptrend', () => {
    const signals = new StochasticOversoldReversalDetector().detect(
      new ScanContext(bullishTrendCandles(50)),
    );
    expect(signals).toHaveLength(0);
  });

  it('detects stochastic overbought reversal', () => {
    const signals = new StochasticOverboughtReversalDetector().detect(
      new ScanContext(withLastCandle(
        bullishTrendCandles(50),
        { time: 51, open: 145, high: 150, low: 124, close: 125, volume: 1000 },
      )),
    );
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.StochasticOverboughtReversal,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('does not fire overbought reversal in downtrend', () => {
    const signals = new StochasticOverboughtReversalDetector().detect(
      new ScanContext(bearishTrendCandles(50)),
    );
    expect(signals).toHaveLength(0);
  });
});
