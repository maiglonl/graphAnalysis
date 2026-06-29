import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { LiquiditySweepHighDetector } from '#shared/utils/detectors/liquidity/liquiditySweepHigh';
import { LiquiditySweepLowDetector } from '#shared/utils/detectors/liquidity/liquiditySweepLow';
import { ScanContext } from '#shared/utils/scanContext';
import { flatCandles, withLastCandle } from '../../../fixtures/candles/factories';

// 20 flat candles at 100: range.high=105, range.low=95.
// SweepHigh: poke above 105 and close back below (close < 105 - 0.1%).
// SweepLow:  poke below 95  and close back above (close > 95 + 0.1%).

describe('liquidity sweep high detector', () => {
  it('detects bearish sweep above range high', () => {
    const signals = new LiquiditySweepHighDetector().detect(new ScanContext(withLastCandle(
      flatCandles(20, 100),
      { time: 21, open: 105, high: 108, low: 102, close: 103, volume: 1000 },
    )));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.LiquiditySweepHigh,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('does not fire when close stays above swept level', () => {
    const signals = new LiquiditySweepHighDetector().detect(new ScanContext(withLastCandle(
      flatCandles(20, 100),
      { time: 21, open: 104, high: 108, low: 104, close: 106, volume: 1000 },
    )));
    expect(signals).toHaveLength(0);
  });

  it('does not fire when candle does not exceed range high', () => {
    const signals = new LiquiditySweepHighDetector().detect(new ScanContext(withLastCandle(
      flatCandles(20, 100),
      { time: 21, open: 100, high: 104, low: 99, close: 101, volume: 1000 },
    )));
    expect(signals).toHaveLength(0);
  });

  it('does not fire with insufficient candle history', () => {
    const signals = new LiquiditySweepHighDetector().detect(new ScanContext(flatCandles(15)));
    expect(signals).toHaveLength(0);
  });
});

describe('liquidity sweep low detector', () => {
  it('detects bullish sweep below range low', () => {
    const signals = new LiquiditySweepLowDetector().detect(new ScanContext(withLastCandle(
      flatCandles(20, 100),
      { time: 21, open: 95, high: 98, low: 91, close: 97, volume: 1000 },
    )));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.LiquiditySweepLow,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('does not fire when close stays below swept level', () => {
    const signals = new LiquiditySweepLowDetector().detect(new ScanContext(withLastCandle(
      flatCandles(20, 100),
      { time: 21, open: 96, high: 96, low: 91, close: 93, volume: 1000 },
    )));
    expect(signals).toHaveLength(0);
  });

  it('does not fire when candle does not break range low', () => {
    const signals = new LiquiditySweepLowDetector().detect(new ScanContext(withLastCandle(
      flatCandles(20, 100),
      { time: 21, open: 100, high: 101, low: 96, close: 99, volume: 1000 },
    )));
    expect(signals).toHaveLength(0);
  });
});
