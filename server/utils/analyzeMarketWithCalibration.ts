import type { AnalyzeResponse, Candle, IntervalEnum } from '#shared/types/market';
import { API } from '#shared/utils/detectors/constants';
import { applyScoreCalibration } from '#shared/utils/calibratedSuggestion';
import { buildScoreCalibration } from '#shared/utils/scoreCalibration';
import { getMarketStructure } from '#shared/utils/marketStructure';
import { buildSuggestion, scanPatterns } from '#shared/utils/scanner';
import { ScanContext } from '#shared/utils/scanContext';
import { summarizeSignalsByQuality } from '#shared/utils/signalQualitySummary';
import { runHistoricalSimulation } from './historicalSimulation';

export type AnalyzeMarketWithCalibrationParams = {
  symbol: string;
  interval: IntervalEnum;
};

export type AnalyzeMarketWithCalibrationResponse = AnalyzeResponse & {
  calibrationAdjustment: number;
};

export async function analyzeMarketWithCalibration(
  params: AnalyzeMarketWithCalibrationParams,
): Promise<AnalyzeMarketWithCalibrationResponse> {
  const response = await $fetch<{ symbol: string; interval: IntervalEnum; candles: Candle[] }>('/api/candles', {
    query: {
      symbol: params.symbol,
      interval: params.interval,
      limit: API.candleLimit,
    },
  });

  const candles = response.candles;
  const last = candles.at(-1);
  const ctx = new ScanContext(candles);
  const patterns = scanPatterns(candles);
  const baseSuggestion = buildSuggestion(candles, patterns);
  const historicalSimulation = runHistoricalSimulation({
    symbol: response.symbol,
    interval: response.interval,
    candles,
  });
  const calibration = buildScoreCalibration(historicalSimulation.patternStats);
  const calibrated = applyScoreCalibration(baseSuggestion, calibration);
  const structure = getMarketStructure(candles, ctx.index, ctx.currentAtr);

  return {
    symbol: response.symbol,
    interval: response.interval,
    price: last?.close ?? null,
    updatedAt: last?.time ?? null,
    candles,
    suggestion: calibrated.suggestion,
    patterns,
    signalQualitySummary: summarizeSignalsByQuality(patterns),
    structure,
    disclaimer: 'common.disclaimer',
    calibrationAdjustment: calibrated.calibrationAdjustment,
  };
}
