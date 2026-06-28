import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { RsiBullishDivergenceDetector } from '#shared/utils/detectors/momentum/rsiBullishDivergence';
import { RsiBearishDivergenceDetector } from '#shared/utils/detectors/momentum/rsiBearishDivergence';
import { MacdBullishDivergenceDetector } from '#shared/utils/detectors/momentum/macdBullishDivergence';
import { MacdBearishDivergenceDetector } from '#shared/utils/detectors/momentum/macdBearishDivergence';
import { ScanContext } from '#shared/utils/scanContext';
import { flatCandles } from '../../../fixtures/candles/factories';

// Bullish divergence fixture:
//   Price makes a lower low (swing low 1 @ idx 32 low=89, swing low 2 @ idx 40 low=87).
//   RSI and MACD histogram make a higher low — classic bullish divergence.
//   The strong bounce in between (indices 35–36) resets momentum before the second decline.
const bullishDivergenceCandles = [
  ...flatCandles(30, 100),
  { time: 31, open: 100, high: 100, low: 96, close: 97, volume: 1000 },
  { time: 32, open: 97, high: 97, low: 92, close: 93, volume: 1000 },
  { time: 33, open: 93, high: 93, low: 89, close: 90, volume: 1000 },  // idx 32 — swing low 1 (low=89)
  { time: 34, open: 90, high: 95, low: 90, close: 93, volume: 1000 },
  { time: 35, open: 93, high: 98, low: 93, close: 96, volume: 1000 },
  { time: 36, open: 96, high: 102, low: 96, close: 100, volume: 1000 },
  { time: 37, open: 100, high: 106, low: 100, close: 104, volume: 1000 },
  { time: 38, open: 104, high: 104, low: 100, close: 101, volume: 1000 },
  { time: 39, open: 101, high: 101, low: 96, close: 97, volume: 1000 },
  { time: 40, open: 97, high: 97, low: 92, close: 93, volume: 1000 },
  { time: 41, open: 93, high: 93, low: 87, close: 88, volume: 1000 },  // idx 40 — swing low 2 (low=87 < 89)
  { time: 42, open: 88, high: 93, low: 88, close: 91, volume: 1000 },
  { time: 43, open: 91, high: 97, low: 91, close: 94, volume: 1000 },  // ctx.index = 42
];

// Bearish divergence fixture:
//   Price makes a higher high (swing high 1 @ idx 32 high=111, swing high 2 @ idx 40 high=113).
//   RSI and MACD histogram make a lower high — classic bearish divergence.
//   The pullback in between (indices 35–37) resets momentum before the second advance.
const bearishDivergenceCandles = [
  ...flatCandles(30, 100),
  { time: 31, open: 100, high: 104, low: 99, close: 103, volume: 1000 },
  { time: 32, open: 103, high: 108, low: 102, close: 107, volume: 1000 },
  { time: 33, open: 107, high: 111, low: 106, close: 110, volume: 1000 },  // idx 32 — swing high 1 (high=111)
  { time: 34, open: 110, high: 110, low: 106, close: 107, volume: 1000 },
  { time: 35, open: 107, high: 107, low: 103, close: 104, volume: 1000 },
  { time: 36, open: 104, high: 104, low: 99, close: 100, volume: 1000 },
  { time: 37, open: 100, high: 100, low: 95, close: 96, volume: 1000 },
  { time: 38, open: 96, high: 100, low: 95, close: 99, volume: 1000 },
  { time: 39, open: 99, high: 104, low: 98, close: 103, volume: 1000 },
  { time: 40, open: 103, high: 108, low: 102, close: 107, volume: 1000 },
  { time: 41, open: 107, high: 113, low: 106, close: 112, volume: 1000 },  // idx 40 — swing high 2 (high=113 > 111)
  { time: 42, open: 112, high: 112, low: 108, close: 109, volume: 1000 },
  { time: 43, open: 109, high: 109, low: 104, close: 106, volume: 1000 },  // ctx.index = 42
];

describe('RSI divergence detectors', () => {
  it('detects bullish RSI divergence', () => {
    const signals = new RsiBullishDivergenceDetector().detect(new ScanContext(bullishDivergenceCandles));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.RsiBullishDivergence,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('does not fire bullish RSI divergence with too few candles', () => {
    const signals = new RsiBullishDivergenceDetector().detect(new ScanContext(flatCandles(10)));
    expect(signals).toHaveLength(0);
  });

  it('detects bearish RSI divergence', () => {
    const signals = new RsiBearishDivergenceDetector().detect(new ScanContext(bearishDivergenceCandles));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.RsiBearishDivergence,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('does not fire bearish RSI divergence with too few candles', () => {
    const signals = new RsiBearishDivergenceDetector().detect(new ScanContext(flatCandles(10)));
    expect(signals).toHaveLength(0);
  });
});

describe('MACD divergence detectors', () => {
  it('detects bullish MACD divergence', () => {
    const signals = new MacdBullishDivergenceDetector().detect(new ScanContext(bullishDivergenceCandles));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.MacdBullishDivergence,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('does not fire bullish MACD divergence with too few candles', () => {
    const signals = new MacdBullishDivergenceDetector().detect(new ScanContext(flatCandles(10)));
    expect(signals).toHaveLength(0);
  });

  it('detects bearish MACD divergence', () => {
    const signals = new MacdBearishDivergenceDetector().detect(new ScanContext(bearishDivergenceCandles));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.MacdBearishDivergence,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('does not fire bearish MACD divergence with too few candles', () => {
    const signals = new MacdBearishDivergenceDetector().detect(new ScanContext(flatCandles(10)));
    expect(signals).toHaveLength(0);
  });
});
