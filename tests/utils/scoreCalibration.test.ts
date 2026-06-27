import { describe, expect, it } from 'vitest';
import { PatternIdEnum, type HistoricalPatternStat } from '#shared/types/market';
import { buildScoreCalibration, getPatternScoreAdjustment } from '#shared/utils/scoreCalibration';

function makeStat(overrides: Partial<HistoricalPatternStat>): HistoricalPatternStat {
  return {
    patternId: PatternIdEnum.Hammer,
    totalTrades: 10,
    wins: 6,
    losses: 4,
    expired: 0,
    winRate: 60,
    averageReturn: 2,
    averageConfidence: 70,
    ...overrides,
  };
}

describe('buildScoreCalibration', () => {
  it('builds a positive adjustment', () => {
    const result = buildScoreCalibration([
      makeStat({ patternId: PatternIdEnum.Hammer, winRate: 70, averageReturn: 4 }),
    ]);

    expect(result.patternAdjustments[0]).toMatchObject({
      patternId: PatternIdEnum.Hammer,
      sampleSize: 10,
      isReliable: true,
      adjustment: 4,
    });
  });

  it('builds a negative adjustment', () => {
    const result = buildScoreCalibration([
      makeStat({ patternId: PatternIdEnum.BearishFvg, winRate: 30, averageReturn: -4 }),
    ]);

    expect(result.patternAdjustments[0]?.adjustment).toBe(-4);
  });

  it('keeps small samples neutral', () => {
    const result = buildScoreCalibration([
      makeStat({ totalTrades: 4, winRate: 90, averageReturn: 10 }),
    ]);

    expect(result.patternAdjustments[0]).toMatchObject({ isReliable: false, adjustment: 0 });
  });

  it('limits very large values', () => {
    const result = buildScoreCalibration([
      makeStat({ winRate: 100, averageReturn: 30 }),
    ]);

    expect(result.patternAdjustments[0]?.adjustment).toBe(8);
  });

  it('returns adjustment by pattern id', () => {
    const result = buildScoreCalibration([
      makeStat({ patternId: PatternIdEnum.BullishEngulfing, winRate: 70, averageReturn: 4 }),
    ]);

    expect(getPatternScoreAdjustment(result, PatternIdEnum.BullishEngulfing)).toBe(4);
    expect(getPatternScoreAdjustment(result, PatternIdEnum.Doji)).toBe(0);
  });
});
