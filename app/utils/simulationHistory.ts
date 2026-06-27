import type { HistoricalSimulationResult, IntervalEnum } from '#shared/types/market';

export const SIMULATION_HISTORY_MAX_ITEMS = 10;

export type SimulationHistorySnapshot = {
  symbol: string;
  interval: IntervalEnum;
  totalTrades: number;
  winRate: number;
  averageReturn: number;
  maxDrawdown: number;
  createdAt: number;
};

export function buildSimulationHistorySnapshot(
  result: HistoricalSimulationResult,
  createdAt = Date.now(),
): SimulationHistorySnapshot {
  return {
    symbol: result.symbol,
    interval: result.interval,
    totalTrades: result.metrics.totalTrades,
    winRate: result.metrics.winRate,
    averageReturn: result.metrics.averageReturn,
    maxDrawdown: result.metrics.maxDrawdown,
    createdAt,
  };
}

export function addSimulationHistorySnapshot(
  items: SimulationHistorySnapshot[],
  snapshot: SimulationHistorySnapshot,
): SimulationHistorySnapshot[] {
  const withoutDuplicate = items.filter(
    (item) => item.symbol !== snapshot.symbol || item.interval !== snapshot.interval,
  );

  return [snapshot, ...withoutDuplicate].slice(0, SIMULATION_HISTORY_MAX_ITEMS);
}
