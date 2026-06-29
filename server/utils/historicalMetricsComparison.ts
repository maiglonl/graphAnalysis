import type { HistoricalSimulationResult } from '#shared/types/market';

export type HistoricalSimulationMetricsComparison = {
  totalTradesDelta: number;
  winRateDelta: number;
  averageReturnDelta: number;
  maxDrawdownDelta: number;
  averageConfidenceDelta: number;
};

export function compareHistoricalSimulationMetrics(
  raw: HistoricalSimulationResult,
  calibrated: HistoricalSimulationResult,
): HistoricalSimulationMetricsComparison {
  return {
    totalTradesDelta: calibrated.metrics.totalTrades - raw.metrics.totalTrades,
    winRateDelta: round(calibrated.metrics.winRate - raw.metrics.winRate),
    averageReturnDelta: round(calibrated.metrics.averageReturn - raw.metrics.averageReturn),
    maxDrawdownDelta: round(calibrated.metrics.maxDrawdown - raw.metrics.maxDrawdown),
    averageConfidenceDelta: round(calibrated.metrics.averageConfidence - raw.metrics.averageConfidence),
  };
}

function round(value: number): number {
  return Number(value.toFixed(2));
}
