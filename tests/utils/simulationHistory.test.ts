import { describe, expect, it } from 'vitest';
import { IntervalEnum, type HistoricalSimulationResult } from '#shared/types/market';
import {
  SIMULATION_HISTORY_MAX_ITEMS,
  addSimulationHistorySnapshot,
  buildSimulationHistorySnapshot,
} from '~/utils/simulationHistory';

function simulation(symbol = 'BTCUSDT'): HistoricalSimulationResult {
  return {
    symbol,
    interval: IntervalEnum.OneHour,
    trades: [],
    patternStats: [],
    familyStats: [],
    metrics: {
      totalTrades: 10,
      wins: 6,
      losses: 4,
      expired: 0,
      winRate: 60,
      lossRate: 40,
      averageRiskReward: 1.5,
      averageReturn: 2,
      maxDrawdown: 3,
      averageConfidence: 70,
    },
  };
}

describe('simulation history utils', () => {
  it('builds compact snapshot from simulation result', () => {
    expect(buildSimulationHistorySnapshot(simulation(), 123)).toEqual({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      totalTrades: 10,
      winRate: 60,
      averageReturn: 2,
      maxDrawdown: 3,
      createdAt: 123,
    });
  });

  it('adds snapshot without duplicates', () => {
    const oldItem = buildSimulationHistorySnapshot(simulation('BTCUSDT'), 1);
    const newItem = buildSimulationHistorySnapshot(simulation('BTCUSDT'), 2);

    expect(addSimulationHistorySnapshot([oldItem], newItem)).toEqual([newItem]);
  });

  it('limits snapshot list size', () => {
    const items = Array.from({ length: SIMULATION_HISTORY_MAX_ITEMS }, (_, index) =>
      buildSimulationHistorySnapshot(simulation(`A${index}`), index),
    );
    const next = buildSimulationHistorySnapshot(simulation('BTCUSDT'), 999);

    expect(addSimulationHistorySnapshot(items, next)).toHaveLength(SIMULATION_HISTORY_MAX_ITEMS);
    expect(addSimulationHistorySnapshot(items, next)[0]).toEqual(next);
  });
});
