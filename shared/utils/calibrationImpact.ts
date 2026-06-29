import { type HistoricalTrade } from '#shared/types/market';
import { SCANNER } from '#shared/utils/detectors/constants';
import { getSuggestionScoreAdjustment, type ScoreCalibrationResult } from '#shared/utils/scoreCalibration';

export type CalibrationImpactTrade = {
  entryTime: number;
  rawConfidence: number;
  calibratedConfidence: number;
  adjustment: number;
};

export type CalibrationImpactSummary = {
  totalTrades: number;
  adjustedTrades: number;
  positiveAdjustments: number;
  negativeAdjustments: number;
  neutralAdjustments: number;
  averageAdjustment: number;
  averageRawConfidence: number;
  averageCalibratedConfidence: number;
  confidenceDelta: number;
  maxPositiveAdjustment: number;
  maxNegativeAdjustment: number;
  trades: CalibrationImpactTrade[];
};

export function summarizeCalibrationImpact(
  trades: HistoricalTrade[],
  calibration: ScoreCalibrationResult,
): CalibrationImpactSummary {
  const items = trades.map((trade) => {
    const adjustment = getSuggestionScoreAdjustment(calibration, trade.patterns);
    return {
      entryTime: trade.entryTime,
      rawConfidence: trade.confidence,
      calibratedConfidence: clampConfidence(trade.confidence + adjustment),
      adjustment,
    };
  });

  const totalTrades = items.length;
  const averageRawConfidence = average(items.map((item) => item.rawConfidence));
  const averageCalibratedConfidence = average(items.map((item) => item.calibratedConfidence));

  return {
    totalTrades,
    adjustedTrades: items.filter((item) => item.adjustment !== 0).length,
    positiveAdjustments: items.filter((item) => item.adjustment > 0).length,
    negativeAdjustments: items.filter((item) => item.adjustment < 0).length,
    neutralAdjustments: items.filter((item) => item.adjustment === 0).length,
    averageAdjustment: round(average(items.map((item) => item.adjustment))),
    averageRawConfidence: round(averageRawConfidence),
    averageCalibratedConfidence: round(averageCalibratedConfidence),
    confidenceDelta: round(averageCalibratedConfidence - averageRawConfidence),
    maxPositiveAdjustment: items.length ? Math.max(...items.map((item) => item.adjustment)) : 0,
    maxNegativeAdjustment: items.length ? Math.min(...items.map((item) => item.adjustment)) : 0,
    trades: items,
  };
}

function clampConfidence(value: number): number {
  return Math.min(
    SCANNER.maxConfidence,
    Math.max(SCANNER.waitConfidence, Math.round(value)),
  );
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number): number {
  return Number(value.toFixed(2));
}
