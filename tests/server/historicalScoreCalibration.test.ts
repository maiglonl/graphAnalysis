import { describe, expect, it } from 'vitest';
import { IntervalEnum, PatternIdEnum, TradeActionEnum, type HistoricalSimulationResult } from '#shared/types/market';
import { buildHistoricalScoreCalibration } from '../../server/utils/historicalScoreCalibration';

function simulation(): HistoricalSimulationResult {
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

describe('historical score calibration', () => {
  it('builds calibration metadata from simulation result', () => {
    const result = buildHistoricalScoreCalibration(simulation());

    expect(result.symbol).toBe('BTCUSDT');
    expect(result.interval).toBe(IntervalEnum.OneHour);
    expect(result.patternAdjustments).toEqual([
      {
        patternId: PatternIdEnum.Hammer,
        sampleSize: 10,
        adjustment: 4,
        winRate: 70,
        averageReturn: 4,
        averageConfidence: 70,
        isReliable: true,
      },
    ]);
  });
});
