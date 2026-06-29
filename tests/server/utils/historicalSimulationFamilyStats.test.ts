import { describe, expect, it } from 'vitest';
import { IntervalEnum } from '#shared/types/market';
import { runHistoricalSimulation } from '../../../server/utils/historicalSimulation';
import { bullishTrendCandles } from '../../fixtures/candles/factories';

describe('runHistoricalSimulation familyStats', () => {
  it('returns familyStats alongside patternStats', () => {
    const result = runHistoricalSimulation({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      candles: bullishTrendCandles(90),
    });

    expect(Array.isArray(result.patternStats)).toBe(true);
    expect(Array.isArray(result.familyStats)).toBe(true);
  });
});
