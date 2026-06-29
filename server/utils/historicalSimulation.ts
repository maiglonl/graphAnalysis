import {
  type Candle,
  type HistoricalSimulationResult,
  type IntervalEnum,
} from '#shared/types/market';
import { HISTORICAL_SIMULATION, SCANNER } from '#shared/utils/detectors/constants';
import { buildSuggestion, scanPatterns } from '#shared/utils/scanner';
import {
  buildHistoricalSimulationResult,
  isActionableSuggestion,
  resolveHistoricalTrade,
} from './historicalSimulationCore';

export type RunHistoricalSimulationParams = {
  symbol: string;
  interval: IntervalEnum;
  candles: Candle[];
};

export function runHistoricalSimulation(params: RunHistoricalSimulationParams): HistoricalSimulationResult {
  const trades = [];

  for (let index = SCANNER.minCandles; index < params.candles.length - 1; index += 1) {
    const visibleCandles = params.candles.slice(0, index + 1);
    const futureCandles = params.candles.slice(index + 1, index + 1 + HISTORICAL_SIMULATION.maxLookaheadCandles);
    const patterns = scanPatterns(visibleCandles);
    const suggestion = buildSuggestion(visibleCandles, patterns);

    if (!isActionableSuggestion(suggestion.action)) continue;
    if (suggestion.confidence < HISTORICAL_SIMULATION.minConfidence) continue;
    if (suggestion.entry == null || suggestion.stop == null || !suggestion.targets?.length) continue;

    trades.push(resolveHistoricalTrade({
      futureCandles,
      action: suggestion.action,
      entry: suggestion.entry,
      stop: suggestion.stop,
      target: suggestion.targets[0],
      patterns: suggestion.reasons,
      confidence: suggestion.confidence,
      entryTime: visibleCandles.at(-1)?.time ?? 0,
    }));
  }

  return buildHistoricalSimulationResult(params, trades);
}
