import type { HistoricalPatternStat, PatternIdEnum } from '#shared/types/market';
import { SCORE_CALIBRATION } from '#shared/utils/detectors/constants';
import { PatternFamilyEnum, PatternSignalRoleEnum, getPatternFamily, getPatternSignalRole } from '#shared/utils/patternFamilies';
import { aggregatePatternStatsByFamily } from '#shared/utils/patternFamilyStats';

type BaseSignalQualityCalibration = {
  sampleSize: number;
  adjustment: number;
  winRate: number;
  averageReturn: number;
  averageConfidence: number;
  isReliable: boolean;
};

export type FamilySignalQualityCalibration = BaseSignalQualityCalibration & { key: PatternFamilyEnum };
export type RoleSignalQualityCalibration = BaseSignalQualityCalibration & { key: PatternSignalRoleEnum };

export type SignalQualityCalibrationResult = {
  familyAdjustments: FamilySignalQualityCalibration[];
  roleAdjustments: RoleSignalQualityCalibration[];
};

type AggregatedStat = {
  totalTrades: number;
  wins: number;
  averageReturn: number;
  averageConfidence: number;
};

export function buildSignalQualityCalibration(patternStats: HistoricalPatternStat[]): SignalQualityCalibrationResult {
  return {
    familyAdjustments: aggregatePatternStatsByFamily(patternStats)
      .map((stat) => buildFamilyCalibration(stat.family, stat))
      .sort((a, b) => Math.abs(b.adjustment) - Math.abs(a.adjustment)),
    roleAdjustments: aggregatePatternStatsByRole(patternStats)
      .map(([role, stat]) => buildRoleCalibration(role, stat))
      .sort((a, b) => Math.abs(b.adjustment) - Math.abs(a.adjustment)),
  };
}

export function getSignalQualityScoreAdjustment(
  calibration: SignalQualityCalibrationResult,
  patternId: PatternIdEnum,
): number {
  const family = getPatternFamily(patternId);
  const role = getPatternSignalRole(patternId);
  const familyAdjustment = calibration.familyAdjustments.find((item) => item.key === family)?.adjustment ?? 0;
  const roleAdjustment = calibration.roleAdjustments.find((item) => item.key === role)?.adjustment ?? 0;
  return clampTotalAdjustment(familyAdjustment + roleAdjustment);
}

function aggregatePatternStatsByRole(stats: HistoricalPatternStat[]): [PatternSignalRoleEnum, AggregatedStat][] {
  const grouped = new Map<PatternSignalRoleEnum, HistoricalPatternStat[]>();

  stats.forEach((stat) => {
    const role = getPatternSignalRole(stat.patternId);
    grouped.set(role, [...(grouped.get(role) ?? []), stat]);
  });

  return [...grouped.entries()].map(([role, roleStats]) => {
    const totalTrades = roleStats.reduce((sum, stat) => sum + stat.totalTrades, 0);
    const wins = roleStats.reduce((sum, stat) => sum + stat.wins, 0);
    const weightedReturn = roleStats.reduce((sum, stat) => sum + stat.averageReturn * stat.totalTrades, 0);
    const weightedConfidence = roleStats.reduce((sum, stat) => sum + stat.averageConfidence * stat.totalTrades, 0);
    return [role, {
      totalTrades,
      wins,
      averageReturn: totalTrades > 0 ? weightedReturn / totalTrades : 0,
      averageConfidence: totalTrades > 0 ? weightedConfidence / totalTrades : 0,
    }];
  });
}

function buildCalibrationBase(stat: AggregatedStat): BaseSignalQualityCalibration {
  const winRate = stat.totalTrades > 0 ? (stat.wins / stat.totalTrades) * 100 : 0;
  const isReliable = stat.totalTrades >= SCORE_CALIBRATION.minTrades;
  return {
    sampleSize: stat.totalTrades,
    adjustment: isReliable ? calculateAdjustment(winRate, stat.averageReturn) : 0,
    winRate,
    averageReturn: stat.averageReturn,
    averageConfidence: stat.averageConfidence,
    isReliable,
  };
}

function buildFamilyCalibration(key: PatternFamilyEnum, stat: AggregatedStat): FamilySignalQualityCalibration {
  return { key, ...buildCalibrationBase(stat) };
}

function buildRoleCalibration(key: PatternSignalRoleEnum, stat: AggregatedStat): RoleSignalQualityCalibration {
  return { key, ...buildCalibrationBase(stat) };
}

function calculateAdjustment(winRate: number, averageReturn: number): number {
  const winRateAdjustment = (winRate - SCORE_CALIBRATION.baselineWinRate) / SCORE_CALIBRATION.winRateStep;
  const returnAdjustment = averageReturn / SCORE_CALIBRATION.averageReturnStep;
  return clampAdjustment(Math.round(winRateAdjustment + returnAdjustment));
}

function clampAdjustment(value: number): number {
  return Math.min(
    SCORE_CALIBRATION.maxAdjustment,
    Math.max(-SCORE_CALIBRATION.maxAdjustment, value),
  );
}

function clampTotalAdjustment(value: number): number {
  return Math.min(
    SCORE_CALIBRATION.maxTotalAdjustment,
    Math.max(-SCORE_CALIBRATION.maxTotalAdjustment, value),
  );
}
