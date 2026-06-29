import { HISTORICAL_SIMULATION, SCANNER } from '#shared/utils/detectors/constants';

export type HistoricalSimulationWindow = {
  trainStartIndex: number;
  trainEndIndex: number;
  validationStartIndex: number;
  validationEndIndex: number;
  trainCandles: number;
  validationCandles: number;
};

export function buildHistoricalSimulationWindow(totalCandles: number): HistoricalSimulationWindow {
  const splitIndex = Math.max(
    SCANNER.minCandles,
    Math.floor(totalCandles * HISTORICAL_SIMULATION.trainValidationSplitRatio),
  );
  const validationStartIndex = Math.min(
    splitIndex,
    Math.max(SCANNER.minCandles, totalCandles - HISTORICAL_SIMULATION.minValidationCandles),
  );
  const validationEndIndex = Math.max(
    validationStartIndex,
    totalCandles - HISTORICAL_SIMULATION.maxLookaheadCandles - 1,
  );

  return {
    trainStartIndex: 0,
    trainEndIndex: Math.max(0, validationStartIndex - 1),
    validationStartIndex,
    validationEndIndex,
    trainCandles: validationStartIndex,
    validationCandles: Math.max(0, totalCandles - validationStartIndex),
  };
}
