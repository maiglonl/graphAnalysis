import { type Candle, type IntervalEnum } from '#shared/types/market';
import { HISTORICAL_SIMULATION, SCANNER } from '#shared/utils/detectors/constants';
import {
  runTrainValidationHistoricalSimulation,
  type TrainValidationHistoricalSimulationResult,
} from './trainValidationHistoricalSimulation';
import type { HistoricalSimulationMetricsComparison } from './historicalMetricsComparison';

export type RunMultiWindowWalkForwardSimulationParams = {
  symbol: string;
  interval: IntervalEnum;
  candles: Candle[];
};

export type MultiWindowWalkForwardSummary = HistoricalSimulationMetricsComparison & {
  windows: number;
  improvedWinRateWindows: number;
  improvedReturnWindows: number;
  reducedDrawdownWindows: number;
};

export type MultiWindowWalkForwardSimulationResult = {
  symbol: string;
  interval: IntervalEnum;
  windows: TrainValidationHistoricalSimulationResult[];
  summary: MultiWindowWalkForwardSummary;
};

export function runMultiWindowWalkForwardSimulation(
  params: RunMultiWindowWalkForwardSimulationParams,
): MultiWindowWalkForwardSimulationResult {
  const slices = buildWindowSlices(params.candles);
  const windows = slices.map((candles) => runTrainValidationHistoricalSimulation({
    symbol: params.symbol,
    interval: params.interval,
    candles,
  }));

  return {
    symbol: params.symbol,
    interval: params.interval,
    windows,
    summary: summarizeWindows(windows),
  };
}

function buildWindowSlices(candles: Candle[]): Candle[][] {
  const minWindowSize = SCANNER.minCandles + HISTORICAL_SIMULATION.minValidationCandles;
  if (candles.length <= minWindowSize) return [candles];

  const windowCount = HISTORICAL_SIMULATION.walkForwardWindowCount;
  const windowSize = Math.max(minWindowSize, Math.floor(candles.length / windowCount));
  const step = Math.max(1, Math.floor((candles.length - windowSize) / Math.max(1, windowCount - 1)));

  return Array.from({ length: windowCount }, (_, index) => {
    const start = Math.min(index * step, Math.max(0, candles.length - windowSize));
    return candles.slice(start, start + windowSize);
  });
}

function summarizeWindows(windows: TrainValidationHistoricalSimulationResult[]): MultiWindowWalkForwardSummary {
  return {
    windows: windows.length,
    totalTradesDelta: round(average(windows.map((item) => item.comparison.totalTradesDelta))),
    winRateDelta: round(average(windows.map((item) => item.comparison.winRateDelta))),
    averageReturnDelta: round(average(windows.map((item) => item.comparison.averageReturnDelta))),
    maxDrawdownDelta: round(average(windows.map((item) => item.comparison.maxDrawdownDelta))),
    averageConfidenceDelta: round(average(windows.map((item) => item.comparison.averageConfidenceDelta))),
    improvedWinRateWindows: windows.filter((item) => item.comparison.winRateDelta > 0).length,
    improvedReturnWindows: windows.filter((item) => item.comparison.averageReturnDelta > 0).length,
    reducedDrawdownWindows: windows.filter((item) => item.comparison.maxDrawdownDelta < 0).length,
  };
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number): number {
  return Number(value.toFixed(2));
}
