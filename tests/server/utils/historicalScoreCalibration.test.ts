import { describe, expect, it } from 'vitest';
import { IntervalEnum, PatternIdEnum, TradeActionEnum } from '#shared/types/market';
import type { HistoricalSimulationResult } from '#shared/types/market';
import { buildHistoricalScoreCalibration } from '../../../server/utils/historicalScoreCalibration';

function simulation(): HistoricalSimulationResult {
  return {
    symbol: 'BTCUSDT',
    interval: IntervalEnum.OneHour,
    trades: [
      {
        entryTime: 1,
        exitTime: 2,
        action: TradeActionEnum.Buy,
        entry: 100,
        stop: 95,
        target: 110,
        result: 'win',
        patterns: [PatternIdEnum.OrderBlockBullish],
        confidence: 60,
      },
    ],
    patternStats: [
      {
        patternId: PatternIdEnum.OrderBlockBullish,
        totalTrades: 10,
        wins: 8,
        losses: 2,
        expired: 0,
        winRate: 80,
        averageReturn: 4,
        averageConfidence: 70,
      },
    ],
    familyStats: [],
    metrics: {
      totalTrades: 1,
      wins: 1,
      losses: 0,
      expired: 0,
      winRate: 100,
      lossRate: 0,
      averageRiskReward: 2,
      averageReturn: 10,
      maxDrawdown: 0,
      averageConfidence: 60,
    },
  };
}

describe('buildHistoricalScoreCalibration', () => {
  it('returns calibration impact summary alongside adjustments', () => {
    const result = buildHistoricalScoreCalibration(simulation());

    expect(result.patternAdjustments).toHaveLength(1);
    expect(result.signalQualityAdjustments.familyAdjustments.length).toBeGreaterThan(0);
    expect(result.calibrationImpact.totalTrades).toBe(1);
    expect(result.calibrationImpact.averageCalibratedConfidence).toBeGreaterThan(result.calibrationImpact.averageRawConfidence);
  });
});
