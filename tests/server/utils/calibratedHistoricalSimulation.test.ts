import { describe, expect, it } from 'vitest';
import { IntervalEnum } from '#shared/types/market';
import { runCalibratedHistoricalSimulation } from '../../../server/utils/calibratedHistoricalSimulation';
import { bullishTrendCandles } from '../../fixtures/candles/factories';

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
});
