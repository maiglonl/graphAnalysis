import { describe, expect, it } from 'vitest';
import { IntervalEnum } from '#shared/types/market';
import { runTrainValidationHistoricalSimulation } from '../../../server/utils/trainValidationHistoricalSimulation';
import { bullishTrendCandles, flatCandles } from '../../fixtures/candles/factories';

describe('runTrainValidationHistoricalSimulation', () => {
  it('returns train and validation simulations with comparison metrics', () => {
    const result = runTrainValidationHistoricalSimulation({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      candles: bullishTrendCandles(140),
    });

    expect(result.symbol).toBe('BTCUSDT');
    expect(result.window.trainCandles).toBeGreaterThan(0);
    expect(result.window.validationCandles).toBeGreaterThan(0);
    expect(result.train.metrics).toBeDefined();
    expect(result.rawValidation.metrics).toBeDefined();
    expect(result.calibratedValidation.metrics).toBeDefined();
    expect(result.calibration.patternAdjustments).toBeDefined();
    expect(result.comparison).toEqual(expect.objectContaining({
      totalTradesDelta: expect.any(Number),
      winRateDelta: expect.any(Number),
      averageReturnDelta: expect.any(Number),
      maxDrawdownDelta: expect.any(Number),
      averageConfidenceDelta: expect.any(Number),
    }));
  });

  it('comparison deltas are consistent with validation metrics', () => {
    const result = runTrainValidationHistoricalSimulation({
      symbol: 'ETHUSDT',
      interval: IntervalEnum.FourHours,
      candles: bullishTrendCandles(140),
    });

    const { rawValidation, calibratedValidation, comparison } = result;
    expect(comparison.totalTradesDelta).toBe(
      calibratedValidation.metrics.totalTrades - rawValidation.metrics.totalTrades
    );
    expect(comparison.winRateDelta).toBeCloseTo(
      calibratedValidation.metrics.winRate - rawValidation.metrics.winRate, 1
    );
  });

  it('validation window is separate from train window', () => {
    const result = runTrainValidationHistoricalSimulation({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      candles: bullishTrendCandles(140),
    });

    expect(result.window.trainEndIndex).toBeLessThan(result.window.validationStartIndex);
    expect(result.window.trainCandles + result.window.validationCandles).toBeLessThanOrEqual(140);
  });

  it('returns zero metrics without error when candles are too few', () => {
    const result = runTrainValidationHistoricalSimulation({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      candles: flatCandles(10),
    });

    expect(result.rawValidation.metrics.totalTrades).toBe(0);
    expect(result.calibratedValidation.metrics.totalTrades).toBe(0);
    expect(result.comparison.totalTradesDelta).toBe(0);
    expect(result.comparison.winRateDelta).toBe(0);
  });
});
