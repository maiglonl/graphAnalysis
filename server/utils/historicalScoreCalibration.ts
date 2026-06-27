import { type HistoricalSimulationResult } from '#shared/types/market';
import { buildScoreCalibration, type ScoreCalibrationResult } from '#shared/utils/scoreCalibration';
import { runHistoricalSimulation, type RunHistoricalSimulationParams } from './historicalSimulation';

export type HistoricalScoreCalibrationResult = ScoreCalibrationResult & {
  symbol: string;
  interval: RunHistoricalSimulationParams['interval'];
};

export function buildHistoricalScoreCalibration(
  simulation: HistoricalSimulationResult,
): HistoricalScoreCalibrationResult {
  return {
    symbol: simulation.symbol,
    interval: simulation.interval,
    ...buildScoreCalibration(simulation.patternStats),
  };
}

export function runHistoricalScoreCalibration(
  params: RunHistoricalSimulationParams,
): HistoricalScoreCalibrationResult {
  return buildHistoricalScoreCalibration(runHistoricalSimulation(params));
}
