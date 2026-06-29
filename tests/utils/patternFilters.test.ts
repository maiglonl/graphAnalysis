import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import { filterSuggestionEligiblePatterns, hasActionableSignal, reducePatternList } from '#shared/utils/patternFilters';

function signal(id: PatternIdEnum, confidence = 60, direction = PatternDirectionEnum.Bullish): PatternSignal {
  return { id, confidence, direction };
}

describe('pattern filters', () => {
  it('keeps actionable and warning signals while limiting context per family', () => {
    const patterns = [
      signal(PatternIdEnum.EqualHighs, 90, PatternDirectionEnum.Neutral),
      signal(PatternIdEnum.EqualLows, 85, PatternDirectionEnum.Neutral),
      signal(PatternIdEnum.OrderBlockBullish, 70),
      signal(PatternIdEnum.LiquiditySweepLow, 68),
    ];

    const reduced = reducePatternList(patterns);

    expect(reduced.some((pattern) => pattern.id === PatternIdEnum.OrderBlockBullish)).toBe(true);
    expect(reduced.some((pattern) => pattern.id === PatternIdEnum.LiquiditySweepLow)).toBe(true);
    expect(reduced.filter((pattern) => pattern.id === PatternIdEnum.EqualHighs || pattern.id === PatternIdEnum.EqualLows)).toHaveLength(1);
  });

  it('detects actionable signals and filters suggestion eligible patterns', () => {
    const patterns = [
      signal(PatternIdEnum.EqualHighs, 90, PatternDirectionEnum.Neutral),
      signal(PatternIdEnum.OrderBlockBullish, 70),
    ];

    expect(hasActionableSignal(patterns)).toBe(true);
    expect(filterSuggestionEligiblePatterns(patterns)).toEqual([patterns[1]]);
  });

  it('falls back to original patterns when no actionable signal is available', () => {
    const patterns = [
      signal(PatternIdEnum.EqualHighs, 90, PatternDirectionEnum.Neutral),
      signal(PatternIdEnum.AtrCompression, 60, PatternDirectionEnum.Neutral),
    ];

    expect(filterSuggestionEligiblePatterns(patterns)).toEqual(patterns);
  });
});
