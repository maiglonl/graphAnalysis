import {
  type Candle,
  type HistoricalSimulationResult,
  type HistoricalTrade,
  type IntervalEnum,
} from '#shared/types/market';
import { HISTORICAL_SIMULATION, SCANNER } from '#shared/utils/detectors/constants';
import {
  buildScoreCalibration,
  getSuggestionScoreAdjustment,
  type ScoreCalibrationResult,
} from '#shared/utils/scoreCalibration';
import { buildSuggestion, scanPatterns } from '#shared/utils/scanner';
import {
  buildHistoricalSimulationResult,
  isActionableSuggestion,
  resolveHistoricalTrade,
} from './historicalSimulationCore';
import { runHistoricalSimulation } from './historicalSimulation';

export type RunCalibratedHistoricalSimulationParams = {
  symbol: string;
  interval: IntervalEnum;
  candles: Candle[];
};

export type HistoricalSimulationMetricsComparison = {
  totalTradesDelta: number;
  winRateDelta: number;
  averageReturnDelta: number;
  maxDrawdownDelta: number;
  averageConfidenceDelta: number;
};

export type CalibratedHistoricalSimulationResult = {
  symbol: string;
  interval: IntervalEnum;
  raw: HistoricalSimulationResult;
  calibrated: HistoricalSimulationResult;
  calibration: ScoreCalibrationResult;
  comparison: HistoricalSimulationMetricsComparison;
};

export function runCalibratedHistoricalSimulation(
  params: RunCalibratedHistoricalSimulationParams,
): CalibratedHistoricalSimulationResult {
  const raw = runHistoricalSimulation(params);
  const calibration = buildScoreCalibration(raw.patternStats);
  const calibratedTrades = runCalibratedTrades(params.candles, calibration);
  const calibrated = buildHistoricalSimulationResult(params, calibratedTrades);

  return {
    symbol: params.symbol,
    interval: params.interval,
    raw,
    calibrated,
    calibration,
    comparison: compareMetrics(raw, calibrated),
  };
}

function runCalibratedTrades(candles: Candle[], calibration: ScoreCalibrationResult): HistoricalTrade[] {
  const trades: HistoricalTrade[] = [];

  for (let index = SCANNER.minCandles; index < candles.length - 1; index += 1) {
    const visibleCandles = candles.slice(0, index + 1);
    const futureCandles = candles.slice(index + 1, index + 1 + HISTORICAL_SIMULATION.maxLookaheadCandles);
    const patterns = scanPatterns(visibleCandles);
    const suggestion = buildSuggestion(visibleCandles, patterns);

    if (!isActionableSuggestion(suggestion.action)) continue;
    if (suggestion.entry == null || suggestion.stop == null || !suggestion.targets?.length) continue;

    const calibrationAdjustment = getSuggestionScoreAdjustment(calibration, suggestion.reasons);
    const calibratedConfidence = clampConfidence(suggestion.confidence + calibrationAdjustment);
    if (calibratedConfidence < HISTORICAL_SIMULATION.minConfidence) continue;

    trades.push(resolveHistoricalTrade({
      futureCandles,
      action: suggestion.action,
      entry: suggestion.entry,
      stop: suggestion.stop,
      target: suggestion.targets[0],
      patterns: suggestion.reasons,
      confidence: calibratedConfidence,
      entryTime: visibleCandles.at(-1)?.time ?? 0,
    }));
  }

  return trades;
}

function compareMetrics(
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

function clampConfidence(value: number): number {
  return Math.min(
    SCANNER.maxConfidence,
    Math.max(SCANNER.waitConfidence, Math.round(value)),
  );
}

function round(value: number): number {
  return Number(value.toFixed(2));
}
