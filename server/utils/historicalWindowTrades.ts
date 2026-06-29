import { type Candle, type HistoricalTrade } from '#shared/types/market';
import { HISTORICAL_SIMULATION, SCANNER } from '#shared/utils/detectors/constants';
import { getSuggestionScoreAdjustment, type ScoreCalibrationResult } from '#shared/utils/scoreCalibration';
import { buildSuggestion, scanPatterns } from '#shared/utils/scanner';
import { isActionableSuggestion, resolveHistoricalTrade } from './historicalSimulationCore';

export type RunHistoricalWindowTradesParams = {
  candles: Candle[];
  startIndex: number;
  endIndex: number;
  calibration?: ScoreCalibrationResult;
};

export function runHistoricalWindowTrades(params: RunHistoricalWindowTradesParams): HistoricalTrade[] {
  const trades: HistoricalTrade[] = [];

  for (let index = params.startIndex; index <= params.endIndex; index += 1) {
    const visibleCandles = params.candles.slice(0, index + 1);
    const futureCandles = params.candles.slice(index + 1, index + 1 + HISTORICAL_SIMULATION.maxLookaheadCandles);
    const patterns = scanPatterns(visibleCandles);
    const suggestion = buildSuggestion(visibleCandles, patterns);

    if (!isActionableSuggestion(suggestion.action)) continue;
    if (suggestion.entry == null || suggestion.stop == null || !suggestion.targets?.length) continue;

    const confidence = params.calibration
      ? clampConfidence(suggestion.confidence + getSuggestionScoreAdjustment(params.calibration, suggestion.reasons))
      : suggestion.confidence;
    if (confidence < HISTORICAL_SIMULATION.minConfidence) continue;

    trades.push(resolveHistoricalTrade({
      futureCandles,
      action: suggestion.action,
      entry: suggestion.entry,
      stop: suggestion.stop,
      target: suggestion.targets[0],
      patterns: suggestion.reasons,
      confidence,
      entryTime: visibleCandles.at(-1)?.time ?? 0,
    }));
  }

  return trades;
}

function clampConfidence(value: number): number {
  return Math.min(
    SCANNER.maxConfidence,
    Math.max(SCANNER.waitConfidence, Math.round(value)),
  );
}
