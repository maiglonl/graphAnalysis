import { describe, expect, it } from 'vitest';
import { PatternIdEnum, type HistoricalPatternStat } from '#shared/types/market';
import {
  buildScoreCalibration,
  getPatternScoreAdjustment,
  getSuggestionScoreAdjustment,
} from '#shared/utils/scoreCalibration';
import { PatternFamilyEnum, PatternSignalRoleEnum } from '#shared/utils/patternFamilies';

function makeStat(overrides: Partial<HistoricalPatternStat> = {}): HistoricalPatternStat {
  const totalTrades = overrides.totalTrades ?? 10;
  const winRate = overrides.winRate ?? 60;
  const wins = overrides.wins ?? Math.round(totalTrades * winRate / 100);
  return {
    patternId: PatternIdEnum.Hammer,
    totalTrades,
    wins,
    losses: totalTrades - wins,
    expired: 0,
    winRate,
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

  it('adds signal quality adjustments by family and role', () => {
    const result = buildScoreCalibration([
      makeStat({ patternId: PatternIdEnum.BullishEngulfing, winRate: 70, averageReturn: 4 }),
    ]);

    expect(result.signalQualityAdjustments.familyAdjustments[0]).toMatchObject({
      key: PatternFamilyEnum.Candle,
      isReliable: true,
      adjustment: 4,
    });
    expect(result.signalQualityAdjustments.roleAdjustments[0]).toMatchObject({
      key: PatternSignalRoleEnum.Actionable,
      isReliable: true,
      adjustment: 4,
    });
    expect(getPatternScoreAdjustment(result, PatternIdEnum.BullishEngulfing)).toBe(12);
  });

  it('uses family and role adjustments as fallback for related patterns', () => {
    const result = buildScoreCalibration([
      makeStat({ patternId: PatternIdEnum.BullishEngulfing, winRate: 70, averageReturn: 4 }),
    ]);

    expect(getPatternScoreAdjustment(result, PatternIdEnum.BullishHarami)).toBeGreaterThan(0);
    expect(getPatternScoreAdjustment(result, PatternIdEnum.MacdBullishCross)).toBe(4);
  });

  it('applies family and role adjustments once per suggestion', () => {
    const result = buildScoreCalibration([
      makeStat({ patternId: PatternIdEnum.BullishEngulfing, winRate: 60, averageReturn: 0 }),
    ]);

    expect(getSuggestionScoreAdjustment(result, [
      PatternIdEnum.BullishEngulfing,
      PatternIdEnum.Hammer,
    ])).toBe(3);
  });
});
