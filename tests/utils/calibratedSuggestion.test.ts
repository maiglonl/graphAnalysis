import { describe, expect, it } from 'vitest';
import { PatternIdEnum, TradeActionEnum, type TradeSuggestion } from '#shared/types/market';
import { applyScoreCalibration } from '#shared/utils/calibratedSuggestion';
import type { ScoreCalibrationResult } from '#shared/utils/scoreCalibration';

function suggestion(overrides: Partial<TradeSuggestion> = {}): TradeSuggestion {
  return {
    action: TradeActionEnum.Buy,
    confidence: 70,
    reasons: [PatternIdEnum.Hammer],
    scoreBreakdown: {
      patternScore: 70,
      structureScore: 0,
      trendScore: 0,
      volumeScore: 0,
      confluenceBonus: 0,
      conflictPenalty: 0,
    },
    ...overrides,
  };
}

function calibration(adjustment: number): ScoreCalibrationResult {
  return {
    patternAdjustments: [
      {
        patternId: PatternIdEnum.Hammer,
        sampleSize: 10,
        adjustment,
        winRate: 70,
        averageReturn: 4,
        averageConfidence: 70,
        isReliable: true,
      },
    ],
  };
}

describe('applyScoreCalibration', () => {
  it('adds calibration adjustment to actionable suggestion confidence', () => {
    const result = applyScoreCalibration(suggestion(), calibration(4));

    expect(result.calibrationAdjustment).toBe(4);
    expect(result.suggestion.confidence).toBe(74);
  });

  it('subtracts calibration adjustment from actionable suggestion confidence', () => {
    const result = applyScoreCalibration(suggestion(), calibration(-4));

    expect(result.calibrationAdjustment).toBe(-4);
    expect(result.suggestion.confidence).toBe(66);
  });

  it('does not apply calibration to wait suggestions', () => {
    const base = suggestion({ action: TradeActionEnum.Wait, confidence: 45 });
    const result = applyScoreCalibration(base, calibration(4));

    expect(result.calibrationAdjustment).toBe(0);
    expect(result.suggestion).toBe(base);
  });

  it('limits total adjustment and final confidence', () => {
    const result = applyScoreCalibration(
      suggestion({ confidence: 90, reasons: [PatternIdEnum.Hammer, PatternIdEnum.Hammer] }),
      calibration(8),
    );

    expect(result.calibrationAdjustment).toBe(12);
    expect(result.suggestion.confidence).toBe(95);
  });
});
