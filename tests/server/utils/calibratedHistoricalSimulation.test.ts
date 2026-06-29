import { describe, expect, it } from 'vitest';
import { IntervalEnum } from '#shared/types/market';
import { runCalibratedHistoricalSimulation } from '../../../server/utils/calibratedHistoricalSimulation';
import { bullishTrendCandles, flatCandles } from '../../fixtures/candles/factories';

describe('runCalibratedHistoricalSimulation', () => {
  it('returns raw and calibrated simulations with comparison metrics', () => {
    const result = runCalibratedHistoricalSimulation({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      candles: bullishTrendCandles(90),
    });

    expect(result.symbol).toBe('BTCUSDT');
    expect(result.interval).toBe(IntervalEnum.OneHour);
    expect(result.raw.metrics).toBeDefined();
    expect(result.calibrated.metrics).toBeDefined();
    expect(result.calibration.patternAdjustments).toBeDefined();
    expect(result.calibration.signalQualityAdjustments).toBeDefined();
    expect(result.comparison).toEqual(expect.objectContaining({
      totalTradesDelta: expect.any(Number),
      winRateDelta: expect.any(Number),
      averageReturnDelta: expect.any(Number),
      maxDrawdownDelta: expect.any(Number),
      averageConfidenceDelta: expect.any(Number),
    }));
  });

  it('comparison deltas are consistent with raw and calibrated metrics', () => {
    const result = runCalibratedHistoricalSimulation({
      symbol: 'ETHUSDT',
      interval: IntervalEnum.FourHours,
      candles: bullishTrendCandles(90),
    });

    const { raw, calibrated, comparison } = result;
    expect(comparison.totalTradesDelta).toBe(calibrated.metrics.totalTrades - raw.metrics.totalTrades);
    expect(comparison.winRateDelta).toBeCloseTo(calibrated.metrics.winRate - raw.metrics.winRate, 1);
    expect(comparison.averageConfidenceDelta).toBeCloseTo(calibrated.metrics.averageConfidence - raw.metrics.averageConfidence, 1);
  });

  it('returns zero metrics without error when there are no trades', () => {
    const result = runCalibratedHistoricalSimulation({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      candles: flatCandles(10),
    });

    expect(result.raw.metrics.totalTrades).toBe(0);
    expect(result.calibrated.metrics.totalTrades).toBe(0);
    expect(result.comparison.totalTradesDelta).toBe(0);
    expect(result.comparison.winRateDelta).toBe(0);
    expect(result.comparison.averageConfidenceDelta).toBe(0);
  });
});
