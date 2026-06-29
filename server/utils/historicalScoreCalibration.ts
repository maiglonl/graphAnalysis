import { type HistoricalSimulationResult } from '#shared/types/market';
import { summarizeCalibrationImpact, type CalibrationImpactSummary } from '#shared/utils/calibrationImpact';
import { buildScoreCalibration, type ScoreCalibrationResult } from '#shared/utils/scoreCalibration';
import { runHistoricalSimulation, type RunHistoricalSimulationParams } from './historicalSimulation';

export type HistoricalScoreCalibrationResult = ScoreCalibrationResult & {
  symbol: string;
  interval: RunHistoricalSimulationParams['interval'];
  calibrationImpact: CalibrationImpactSummary;
};

export function buildHistoricalScoreCalibration(
  simulation: HistoricalSimulationResult,
): HistoricalScoreCalibrationResult {
  const calibration = buildScoreCalibration(simulation.patternStats);

  return {
    symbol: simulation.symbol,
    interval: simulation.interval,
    ...calibration,
    calibrationImpact: summarizeCalibrationImpact(simulation.trades, calibration),
  };
}

export function runHistoricalScoreCalibration(
  params: RunHistoricalSimulationParams,
): HistoricalScoreCalibrationResult {
  return buildHistoricalScoreCalibration(runHistoricalSimulation(params));
}
