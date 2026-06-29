import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import { PatternFamilyEnum, PatternSignalRoleEnum } from '#shared/utils/patternFamilies';
import { summarizeSignalsByQuality } from '#shared/utils/signalQualitySummary';

function signal(id: PatternIdEnum, confidence = 60, direction = PatternDirectionEnum.Bullish): PatternSignal {
  return { id, confidence, direction };
}

describe('summarizeSignalsByQuality', () => {
  it('summarizes signals by family and role', () => {
    const summary = summarizeSignalsByQuality([
      signal(PatternIdEnum.OrderBlockBullish, 80),
      signal(PatternIdEnum.LiquiditySweepHigh, 70, PatternDirectionEnum.Bearish),
      signal(PatternIdEnum.EqualHighs, 50, PatternDirectionEnum.Neutral),
      signal(PatternIdEnum.MacdBullishCross, 60),
    ]);

    expect(summary.byFamily[0]).toMatchObject({
      key: PatternFamilyEnum.Liquidity,
      total: 3,
      bullish: 1,
      bearish: 1,
      neutral: 1,
    });
    expect(summary.byRole.find((item) => item.key === PatternSignalRoleEnum.Actionable)).toMatchObject({ total: 2 });
    expect(summary.byRole.find((item) => item.key === PatternSignalRoleEnum.Warning)).toMatchObject({ total: 1 });
    expect(summary.byRole.find((item) => item.key === PatternSignalRoleEnum.Context)).toMatchObject({ total: 1 });
  });
});
