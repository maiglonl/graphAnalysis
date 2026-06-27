import type { HistoricalPatternStat, PatternIdEnum } from '#shared/types/market';
import { SCORE_CALIBRATION } from '#shared/utils/detectors/constants';

export type PatternScoreCalibration = {
  patternId: PatternIdEnum;
  sampleSize: number;
  adjustment: number;
  winRate: number;
  averageReturn: number;
  averageConfidence: number;
  isReliable: boolean;
};

export type ScoreCalibrationResult = {
  patternAdjustments: PatternScoreCalibration[];
};

export function buildScoreCalibration(patternStats: HistoricalPatternStat[]): ScoreCalibrationResult {
  return {
    patternAdjustments: patternStats
      .map((stat) => buildPatternCalibration(stat))
      .sort((a, b) => Math.abs(b.adjustment) - Math.abs(a.adjustment)),
  };
}

function buildPatternCalibration(stat: HistoricalPatternStat): PatternScoreCalibration {
  const isReliable = stat.totalTrades >= SCORE_CALIBRATION.minTrades;
  const adjustment = isReliable ? calculateAdjustment(stat) : 0;

  return {
    patternId: stat.patternId,
    sampleSize: stat.totalTrades,
    adjustment,
    winRate: stat.winRate,
    averageReturn: stat.averageReturn,
    averageConfidence: stat.averageConfidence,
    isReliable,
  };
}

function calculateAdjustment(stat: HistoricalPatternStat): number {
  const winRateAdjustment = (stat.winRate - SCORE_CALIBRATION.baselineWinRate) / SCORE_CALIBRATION.winRateStep;
  const returnAdjustment = stat.averageReturn / SCORE_CALIBRATION.averageReturnStep;
  const rawAdjustment = winRateAdjustment + returnAdjustment;

  return clampAdjustment(Math.round(rawAdjustment));
}

function clampAdjustment(value: number): number {
  return Math.min(
    SCORE_CALIBRATION.maxAdjustment,
    Math.max(-SCORE_CALIBRATION.maxAdjustment, value),
  );
}

export function getPatternScoreAdjustment(
  calibration: ScoreCalibrationResult,
  patternId: PatternIdEnum,
): number {
  return calibration.patternAdjustments.find((item) => item.patternId === patternId)?.adjustment ?? 0;
}
