import { TradeActionEnum, type TradeSuggestion } from '#shared/types/market';
import { SCORE_CALIBRATION, SCANNER } from '#shared/utils/detectors/constants';
import {
  getSuggestionScoreAdjustment,
  type ScoreCalibrationResult,
} from '#shared/utils/scoreCalibration';

export type CalibratedSuggestionResult = {
  suggestion: TradeSuggestion;
  calibrationAdjustment: number;
};

export function applyScoreCalibration(
  suggestion: TradeSuggestion,
  calibration: ScoreCalibrationResult,
): CalibratedSuggestionResult {
  if (!isActionableSuggestion(suggestion)) {
    return {
      suggestion,
      calibrationAdjustment: 0,
    };
  }

  const calibrationAdjustment = clampTotalAdjustment(
    getSuggestionScoreAdjustment(calibration, suggestion.reasons),
  );

  return {
    suggestion: {
      ...suggestion,
      confidence: clampConfidence(suggestion.confidence + calibrationAdjustment),
    },
    calibrationAdjustment,
  };
}

function isActionableSuggestion(suggestion: TradeSuggestion): boolean {
  return suggestion.action === TradeActionEnum.Buy || suggestion.action === TradeActionEnum.Sell;
}

function clampTotalAdjustment(value: number): number {
  return Math.min(
    SCORE_CALIBRATION.maxTotalAdjustment,
    Math.max(-SCORE_CALIBRATION.maxTotalAdjustment, value),
  );
}

function clampConfidence(value: number): number {
  return Math.min(
    SCANNER.maxConfidence,
    Math.max(SCANNER.waitConfidence, Math.round(value)),
  );
}
