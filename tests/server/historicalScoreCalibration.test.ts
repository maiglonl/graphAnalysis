import { describe, expect, it } from 'vitest';
import { IntervalEnum, PatternIdEnum, type HistoricalSimulationResult } from '#shared/types/market';
import { buildHistoricalScoreCalibration } from '../../server/utils/historicalScoreCalibration';

function makeSimulation(): HistoricalSimulationResult {
  return {
    symbol: 'BTCUSDT',
    interval: IntervalEnum.OneHour,
    trades: [],
    metrics: {
      totalTrades: 10,
      wins: 7,
      losses: 3,
      expired: 0,
      winRate: 70,
      lossRate: 30,
      averageRiskReward: 1,
      averageReturn: 4,
      maxDrawdown: 2,
      averageConfidence: 70,
    },
    patternStats: [
      {
        patternId: PatternIdEnum.Hammer,
        totalTrades: 10,
        wins: 7,
        losses: 3,
        expired: 0,
        winRate: 70,
        averageReturn: 4,
        averageConfidence: 70,
      },
    ],
  };
}

describe('buildHistoricalScoreCalibration', () => {
  it('maps simulation stats to pattern adjustments', () => {
    const result = buildHistoricalScoreCalibration(makeSimulation());

    expect(result.symbol).toBe('BTCUSDT');
    expect(result.interval).toBe(IntervalEnum.OneHour);
    expect(result.patternAdjustments[0]).toMatchObject({
      patternId: PatternIdEnum.Hammer,
      sampleSize: 10,
      adjustment: 4,
      isReliable: true,
    });
  });
});
