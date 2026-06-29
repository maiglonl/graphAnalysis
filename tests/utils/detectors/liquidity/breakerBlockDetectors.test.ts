import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { BreakerBlockBullishDetector } from '#shared/utils/detectors/liquidity/breakerBlockBullish';
import { BreakerBlockBearishDetector } from '#shared/utils/detectors/liquidity/breakerBlockBearish';
import { ScanContext } from '#shared/utils/scanContext';
import { flatCandles, withLastCandle } from '../../../fixtures/candles/factories';

// 10 flat candles at 100: high=105 each → brokenHigh=105, low=95 → brokenLow=95.
// Bullish: close above 105 after touching (retest), bullish candle.
// Bearish: close below 95 after touching (retest), bearish candle.

describe('breaker block bullish detector', () => {
  it('detects bullish retest of broken high with bullish reaction', () => {
    const signals = new BreakerBlockBullishDetector().detect(new ScanContext(withLastCandle(
      flatCandles(10, 100),
      { time: 11, open: 104, high: 108, low: 104, close: 107, volume: 1000 },
    )));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.BreakerBlockBullish,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('does not fire without bullish reaction (bearish close)', () => {
    const signals = new BreakerBlockBullishDetector().detect(new ScanContext(withLastCandle(
      flatCandles(10, 100),
      { time: 11, open: 108, high: 109, low: 104, close: 104, volume: 1000 },
    )));
    expect(signals).toHaveLength(0);
  });

  it('does not fire when close does not exceed broken high', () => {
    const signals = new BreakerBlockBullishDetector().detect(new ScanContext(withLastCandle(
      flatCandles(10, 100),
      { time: 11, open: 102, high: 104, low: 101, close: 103, volume: 1000 },
    )));
    expect(signals).toHaveLength(0);
  });

  it('does not fire with insufficient history', () => {
    const signals = new BreakerBlockBullishDetector().detect(new ScanContext(flatCandles(5)));
    expect(signals).toHaveLength(0);
  });
});

describe('breaker block bearish detector', () => {
  it('detects bearish retest of broken low with bearish reaction', () => {
    const signals = new BreakerBlockBearishDetector().detect(new ScanContext(withLastCandle(
      flatCandles(10, 100),
      { time: 11, open: 96, high: 96, low: 92, close: 93, volume: 1000 },
    )));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.BreakerBlockBearish,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('does not fire without bearish reaction (bullish close)', () => {
    const signals = new BreakerBlockBearishDetector().detect(new ScanContext(withLastCandle(
      flatCandles(10, 100),
      { time: 11, open: 92, high: 96, low: 91, close: 96, volume: 1000 },
    )));
    expect(signals).toHaveLength(0);
  });

  it('does not fire when close does not break below broken low', () => {
    const signals = new BreakerBlockBearishDetector().detect(new ScanContext(withLastCandle(
      flatCandles(10, 100),
      { time: 11, open: 98, high: 99, low: 96, close: 97, volume: 1000 },
    )));
    expect(signals).toHaveLength(0);
  });

  it('does not fire with insufficient history', () => {
    const signals = new BreakerBlockBearishDetector().detect(new ScanContext(flatCandles(5)));
    expect(signals).toHaveLength(0);
  });
});
