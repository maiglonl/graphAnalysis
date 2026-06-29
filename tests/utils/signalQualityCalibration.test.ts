import { describe, expect, it } from 'vitest';
import { PatternIdEnum } from '#shared/types/market';
import type { HistoricalPatternStat } from '#shared/types/market';
import { PatternFamilyEnum, PatternSignalRoleEnum } from '#shared/utils/patternFamilies';
import {
  buildSignalQualityCalibration,
  getSignalQualityScoreAdjustment,
} from '#shared/utils/signalQualityCalibration';

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

describe('signal quality calibration', () => {
  it('builds family and role adjustments from historical stats', () => {
    const calibration = buildSignalQualityCalibration([
      stat(PatternIdEnum.OrderBlockBullish, 10, 8, 4),
      stat(PatternIdEnum.OrderBlockBearish, 10, 6, 2),
      stat(PatternIdEnum.EqualHighs, 2, 1, 0),
    ]);

    const liquidity = calibration.familyAdjustments.find((item) => item.key === PatternFamilyEnum.Liquidity);
    const actionable = calibration.roleAdjustments.find((item) => item.key === PatternSignalRoleEnum.Actionable);

    expect(liquidity).toMatchObject({ sampleSize: 22, isReliable: true });
    expect(actionable).toMatchObject({ sampleSize: 20, isReliable: true });
    expect(liquidity?.adjustment).toBeGreaterThan(0);
    expect(actionable?.adjustment).toBeGreaterThan(0);
  });

  it('returns zero adjustment for unreliable groups', () => {
    const calibration = buildSignalQualityCalibration([
      stat(PatternIdEnum.MacdBullishCross, 2, 2, 5),
    ]);

    const momentum = calibration.familyAdjustments.find((item) => item.key === PatternFamilyEnum.Momentum);
    expect(momentum).toMatchObject({ sampleSize: 2, isReliable: false, adjustment: 0 });
  });

  it('combines family and role adjustments with total clamp', () => {
    const calibration = buildSignalQualityCalibration([
      stat(PatternIdEnum.OrderBlockBullish, 20, 20, 20),
      stat(PatternIdEnum.OrderBlockBearish, 20, 20, 20),
    ]);

    expect(getSignalQualityScoreAdjustment(calibration, PatternIdEnum.OrderBlockBullish)).toBeLessThanOrEqual(12);
    expect(getSignalQualityScoreAdjustment(calibration, PatternIdEnum.OrderBlockBullish)).toBeGreaterThan(0);
  });
});
