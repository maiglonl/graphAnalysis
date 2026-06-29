import type { HistoricalPatternStat } from '#shared/types/market';
import { PatternFamilyEnum, getPatternFamily } from '#shared/utils/patternFamilies';

export type PatternGroupStat = {
  family: PatternFamilyEnum;
  totalTrades: number;
  wins: number;
  losses: number;
  expired: number;
  winRate: number;
  averageReturn: number;
  averageConfidence: number;
};

export function aggregatePatternStatsByFamily(stats: HistoricalPatternStat[]): PatternGroupStat[] {
  const grouped = new Map<PatternFamilyEnum, HistoricalPatternStat[]>();

  stats.forEach((stat) => {
    const family = getPatternFamily(stat.patternId);
    grouped.set(family, [...(grouped.get(family) ?? []), stat]);
  });

  return [...grouped.entries()].map(([family, familyStats]) => {
    const totalTrades = familyStats.reduce((sum, stat) => sum + stat.totalTrades, 0);
    const wins = familyStats.reduce((sum, stat) => sum + stat.wins, 0);
    const losses = familyStats.reduce((sum, stat) => sum + stat.losses, 0);
    const expired = familyStats.reduce((sum, stat) => sum + stat.expired, 0);
    const weightedReturn = familyStats.reduce((sum, stat) => sum + stat.averageReturn * stat.totalTrades, 0);
    const weightedConfidence = familyStats.reduce((sum, stat) => sum + stat.averageConfidence * stat.totalTrades, 0);

    return {
      family,
      totalTrades,
      wins,
      losses,
      expired,
      winRate: totalTrades > 0 ? (wins / totalTrades) * 100 : 0,
      averageReturn: totalTrades > 0 ? weightedReturn / totalTrades : 0,
      averageConfidence: totalTrades > 0 ? weightedConfidence / totalTrades : 0,
    };
  }).sort((a, b) => b.totalTrades - a.totalTrades);
}
