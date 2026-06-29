import { describe, expect, it } from 'vitest';
import { PatternIdEnum } from '#shared/types/market';
import type { HistoricalPatternStat } from '#shared/types/market';
import { PatternFamilyEnum } from '#shared/utils/patternFamilies';
import { aggregatePatternStatsByFamily } from '#shared/utils/patternFamilyStats';

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

describe('pattern family stats', () => {
  it('aggregates historical stats by pattern family', () => {
    const groups = aggregatePatternStatsByFamily([
      stat(PatternIdEnum.OrderBlockBullish, 10, 7, 2),
      stat(PatternIdEnum.LiquiditySweepLow, 5, 2, -1),
      stat(PatternIdEnum.MacdBullishCross, 4, 2, 1),
    ]);

    const liquidity = groups.find((group) => group.family === PatternFamilyEnum.Liquidity);
    const momentum = groups.find((group) => group.family === PatternFamilyEnum.Momentum);

    expect(liquidity).toMatchObject({ totalTrades: 15, wins: 9, losses: 6 });
    expect(liquidity?.winRate).toBe(60);
    expect(liquidity?.averageReturn).toBeCloseTo(1);
    expect(momentum).toMatchObject({ totalTrades: 4, wins: 2, losses: 2 });
  });
});
