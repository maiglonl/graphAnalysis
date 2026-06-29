import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EqualHighsDetector } from '#shared/utils/detectors/liquidity/equalHighs';
import { EqualLowsDetector } from '#shared/utils/detectors/liquidity/equalLows';
import { ScanContext } from '#shared/utils/scanContext';
import { flatCandles, withLastCandle } from '../../../fixtures/candles/factories';

// 20 flat candles at 100: range.high=105, range.low=95.
// areNear tolerance = 0.3% → |a-b|/max(a,b) ≤ 0.003.

describe('equal highs detector', () => {
  it('detects equal high within tolerance', () => {
    const signals = new EqualHighsDetector().detect(new ScanContext(withLastCandle(
      flatCandles(20, 100),
      { time: 21, open: 100, high: 105.2, low: 99, close: 101, volume: 1000 },
    )));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.EqualHighs,
      direction: PatternDirectionEnum.Neutral,
    });
  });

  it('does not fire when high is far from range high', () => {
    const signals = new EqualHighsDetector().detect(new ScanContext(withLastCandle(
      flatCandles(20, 100),
      { time: 21, open: 105, high: 110, low: 104, close: 107, volume: 1000 },
    )));
    expect(signals).toHaveLength(0);
  });

  it('does not fire below range high', () => {
    const signals = new EqualHighsDetector().detect(new ScanContext(withLastCandle(
      flatCandles(20, 100),
      { time: 21, open: 98, high: 100, low: 97, close: 99, volume: 1000 },
    )));
    expect(signals).toHaveLength(0);
  });
});

describe('equal lows detector', () => {
  it('detects equal low within tolerance', () => {
    const signals = new EqualLowsDetector().detect(new ScanContext(withLastCandle(
      flatCandles(20, 100),
      { time: 21, open: 100, high: 101, low: 94.9, close: 99, volume: 1000 },
    )));
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.EqualLows,
      direction: PatternDirectionEnum.Neutral,
    });
  });

  it('does not fire when low is far from range low', () => {
    const signals = new EqualLowsDetector().detect(new ScanContext(withLastCandle(
      flatCandles(20, 100),
      { time: 21, open: 92, high: 93, low: 88, close: 91, volume: 1000 },
    )));
    expect(signals).toHaveLength(0);
  });

  it('does not fire above range low', () => {
    const signals = new EqualLowsDetector().detect(new ScanContext(withLastCandle(
      flatCandles(20, 100),
      { time: 21, open: 100, high: 102, low: 98, close: 101, volume: 1000 },
    )));
    expect(signals).toHaveLength(0);
  });
});
