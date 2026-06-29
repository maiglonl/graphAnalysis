import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import { PatternFamilyEnum, PatternSignalRoleEnum, getPatternFamily, getPatternSignalRole } from '#shared/utils/patternFamilies';
import {
  getPatternQualityMetadata,
  getPrimaryActionablePattern,
  groupPatternsByFamily,
  isActionablePatternSignal,
  isContextPatternSignal,
  isWarningPatternSignal,
  sortPatternsBySignalQuality,
} from '#shared/utils/patternSignalQuality';

function signal(id: PatternIdEnum, confidence = 60, direction = PatternDirectionEnum.Bullish): PatternSignal {
  return { id, confidence, direction };
}

describe('pattern families and signal quality', () => {
  it('classifies families and roles', () => {
    expect(getPatternFamily(PatternIdEnum.OrderBlockBullish)).toBe(PatternFamilyEnum.Liquidity);
    expect(getPatternFamily(PatternIdEnum.BullishBos)).toBe(PatternFamilyEnum.Structure);
    expect(getPatternFamily(PatternIdEnum.MacdBullishCross)).toBe(PatternFamilyEnum.Momentum);

    expect(getPatternSignalRole(PatternIdEnum.EqualHighs)).toBe(PatternSignalRoleEnum.Context);
    expect(getPatternSignalRole(PatternIdEnum.LiquiditySweepHigh)).toBe(PatternSignalRoleEnum.Warning);
    expect(getPatternSignalRole(PatternIdEnum.OrderBlockBullish)).toBe(PatternSignalRoleEnum.Actionable);
  });

  it('sorts signals by role, family and confidence', () => {
    const patterns = [
      signal(PatternIdEnum.Hammer, 90),
      signal(PatternIdEnum.OrderBlockBullish, 60),
      signal(PatternIdEnum.EqualHighs, 90, PatternDirectionEnum.Neutral),
    ];

    // OrderBlockBullish: Liquidity(8) * Actionable(3) * 60 = 1440
    // EqualHighs:        Liquidity(8) * Context(1)    * 90 = 720
    // Hammer:            Candle(1)    * Actionable(3) * 90 = 270
    const sorted = sortPatternsBySignalQuality(patterns);
    expect(sorted[0]?.id).toBe(PatternIdEnum.OrderBlockBullish);
    expect(sorted[1]?.id).toBe(PatternIdEnum.EqualHighs);
    expect(sorted[2]?.id).toBe(PatternIdEnum.Hammer);
  });

  it('returns primary actionable signal and role helpers', () => {
    const patterns = [
      signal(PatternIdEnum.EqualLows, 90, PatternDirectionEnum.Neutral),
      signal(PatternIdEnum.LiquiditySweepLow, 80),
      signal(PatternIdEnum.RetestSupport, 70),
    ];

    expect(isContextPatternSignal(patterns[0]!)).toBe(true);
    expect(isWarningPatternSignal(patterns[1]!)).toBe(true);
    expect(isActionablePatternSignal(patterns[2]!)).toBe(true);
    expect(getPrimaryActionablePattern(patterns)?.id).toBe(PatternIdEnum.RetestSupport);
  });

  it('groups by family and exposes rank metadata', () => {
    const patterns = [
      signal(PatternIdEnum.OrderBlockBullish, 70),
      signal(PatternIdEnum.MacdBullishCross, 70),
    ];

    const groups = groupPatternsByFamily(patterns);
    expect(groups[PatternFamilyEnum.Liquidity]).toHaveLength(1);
    expect(groups[PatternFamilyEnum.Momentum]).toHaveLength(1);
    expect(getPatternQualityMetadata(patterns[0]!).rank).toBeGreaterThan(getPatternQualityMetadata(patterns[1]!).rank);
  });
});
