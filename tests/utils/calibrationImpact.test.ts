import { describe, expect, it } from 'vitest';
import { PatternIdEnum, TradeActionEnum } from '#shared/types/market';
import type { HistoricalTrade } from '#shared/types/market';
import { buildScoreCalibration } from '#shared/utils/scoreCalibration';
import { summarizeCalibrationImpact } from '#shared/utils/calibrationImpact';
import type { HistoricalPatternStat } from '#shared/types/market';

function stat(patternId: PatternIdEnum, totalTrades: number, wins: number, averageReturn: number): HistoricalPatternStat {
  return {
    patternId,
    totalTrades,
    wins,
    losses: totalTrades - wins,
    expired: 0,
    winRate: totalTrades > 0 ? (wins / totalTrades) * 100 : 0,
    averageReturn,
    averageConfidence: 70,
  };
}

function trade(patterns: PatternIdEnum[], confidence = 60): HistoricalTrade {
  return {
    entryTime: 1,
    exitTime: 2,
    action: TradeActionEnum.Buy,
    entry: 100,
    stop: 95,
    target: 110,
    result: 'win',
    patterns,
    confidence,
  };
}

describe('summarizeCalibrationImpact', () => {
  it('summarizes confidence changes produced by calibration', () => {
    const calibration = buildScoreCalibration([
      stat(PatternIdEnum.OrderBlockBullish, 20, 20, 20),
      stat(PatternIdEnum.OrderBlockBearish, 20, 20, 20),
    ]);

    const summary = summarizeCalibrationImpact([
      trade([PatternIdEnum.OrderBlockBullish], 60),
      trade([PatternIdEnum.EqualHighs], 70),
    ], calibration);

    expect(summary.totalTrades).toBe(2);
    expect(summary.adjustedTrades).toBeGreaterThan(0);
    expect(summary.averageCalibratedConfidence).toBeGreaterThan(summary.averageRawConfidence);
    expect(summary.maxPositiveAdjustment).toBeLessThanOrEqual(12);
    expect(summary.trades).toHaveLength(2);
  });

  it('returns neutral values when there are no trades', () => {
    const calibration = buildScoreCalibration([]);
    const summary = summarizeCalibrationImpact([], calibration);

    expect(summary.totalTrades).toBe(0);
    expect(summary.averageAdjustment).toBe(0);
    expect(summary.trades).toEqual([]);
  });
});
