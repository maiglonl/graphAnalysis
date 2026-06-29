import type { PatternSignal } from '#shared/types/market';
import { SCANNER } from '#shared/utils/detectors/constants';
import { PatternSignalRoleEnum, getPatternFamily, getPatternSignalRole } from '#shared/utils/patternFamilies';
import { sortPatternsBySignalQuality } from '#shared/utils/patternSignalQuality';

export function reducePatternNoise(patterns: PatternSignal[]): PatternSignal[] {
  const sorted = sortPatternsBySignalQuality(patterns);
  const contextCountByFamily = new Map<string, number>();

  return sorted.filter((pattern) => {
    const role = getPatternSignalRole(pattern.id);
    if (role !== PatternSignalRoleEnum.Context) return true;

    const family = getPatternFamily(pattern.id);
    const currentCount = contextCountByFamily.get(family) ?? 0;
    if (currentCount >= SCANNER.maxContextSignalsPerFamily) return false;

    contextCountByFamily.set(family, currentCount + 1);
    return true;
  });
}

export function hasActionableSignal(patterns: PatternSignal[]): boolean {
  return patterns.some((pattern) => getPatternSignalRole(pattern.id) === PatternSignalRoleEnum.Actionable);
}

export function filterSuggestionEligiblePatterns(patterns: PatternSignal[]): PatternSignal[] {
  const actionable = patterns.filter((pattern) => (
    getPatternSignalRole(pattern.id) === PatternSignalRoleEnum.Actionable &&
    pattern.confidence >= SCANNER.minActionableConfidenceForSuggestion
  ));

  return actionable.length > 0 ? actionable : patterns;
}
