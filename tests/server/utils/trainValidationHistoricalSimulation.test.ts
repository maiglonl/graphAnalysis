import { describe, expect, it } from 'vitest';
import { IntervalEnum } from '#shared/types/market';
import { runTrainValidationHistoricalSimulation } from '../../../server/utils/trainValidationHistoricalSimulation';
import { bullishTrendCandles } from '../../fixtures/candles/factories';

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
});
