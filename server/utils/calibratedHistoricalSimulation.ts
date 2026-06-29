import {
  type Candle,
  type HistoricalSimulationResult,
  type IntervalEnum,
} from '#shared/types/market';
import { SCANNER } from '#shared/utils/detectors/constants';
import { buildScoreCalibration, type ScoreCalibrationResult } from '#shared/utils/scoreCalibration';
import { buildHistoricalSimulationResult } from './historicalSimulationCore';
import { runHistoricalSimulation } from './historicalSimulation';
import {
  compareHistoricalSimulationMetrics,
  type HistoricalSimulationMetricsComparison,
} from './historicalMetricsComparison';
import { runHistoricalWindowTrades } from './historicalWindowTrades';

export type RunCalibratedHistoricalSimulationParams = {
  symbol: string;
  interval: IntervalEnum;
  candles: Candle[];
};

export type { HistoricalSimulationMetricsComparison };

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
  const calibratedTrades = runHistoricalWindowTrades({
    candles: params.candles,
    startIndex: SCANNER.minCandles,
    endIndex: params.candles.length - 2,
    calibration,
  });
  const calibrated = buildHistoricalSimulationResult(params, calibratedTrades);

  return {
    symbol: params.symbol,
    interval: params.interval,
    raw,
    calibrated,
    calibration,
    comparison: compareHistoricalSimulationMetrics(raw, calibrated),
  };
}
