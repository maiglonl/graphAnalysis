import { type Candle, type HistoricalSimulationResult, type IntervalEnum } from '#shared/types/market';
import { buildScoreCalibration, type ScoreCalibrationResult } from '#shared/utils/scoreCalibration';
import { buildHistoricalSimulationResult } from './historicalSimulationCore';
import { runHistoricalSimulation } from './historicalSimulation';
import { buildHistoricalSimulationWindow, type HistoricalSimulationWindow } from './historicalSimulationWindow';
import { runHistoricalWindowTrades } from './historicalWindowTrades';
import { compareHistoricalSimulationMetrics, type HistoricalSimulationMetricsComparison } from './historicalMetricsComparison';

export type RunTrainValidationHistoricalSimulationParams = {
  symbol: string;
  interval: IntervalEnum;
  candles: Candle[];
};

export type TrainValidationHistoricalSimulationResult = {
  symbol: string;
  interval: IntervalEnum;
  window: HistoricalSimulationWindow;
  train: HistoricalSimulationResult;
  rawValidation: HistoricalSimulationResult;
  calibratedValidation: HistoricalSimulationResult;
  calibration: ScoreCalibrationResult;
  comparison: HistoricalSimulationMetricsComparison;
};

export function runTrainValidationHistoricalSimulation(
  params: RunTrainValidationHistoricalSimulationParams,
): TrainValidationHistoricalSimulationResult {
  const window = buildHistoricalSimulationWindow(params.candles.length);
  const train = runHistoricalSimulation({
    symbol: params.symbol,
    interval: params.interval,
    candles: params.candles.slice(window.trainStartIndex, window.trainEndIndex + 1),
  });
  const calibration = buildScoreCalibration(train.patternStats);
  const rawValidation = buildHistoricalSimulationResult(
    params,
    runHistoricalWindowTrades({
      candles: params.candles,
      startIndex: window.validationStartIndex,
      endIndex: window.validationEndIndex,
    }),
  );
  const calibratedValidation = buildHistoricalSimulationResult(
    params,
    runHistoricalWindowTrades({
      candles: params.candles,
      startIndex: window.validationStartIndex,
      endIndex: window.validationEndIndex,
      calibration,
    }),
  );

  return {
    symbol: params.symbol,
    interval: params.interval,
    window,
    train,
    rawValidation,
    calibratedValidation,
    calibration,
    comparison: compareHistoricalSimulationMetrics(rawValidation, calibratedValidation),
  };
}
