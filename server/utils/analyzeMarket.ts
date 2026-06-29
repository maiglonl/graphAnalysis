import type { AnalyzeResponse, Candle, IntervalEnum } from '#shared/types/market';
import { API } from '#shared/utils/detectors/constants';
import { getMarketStructure } from '#shared/utils/marketStructure';
import { buildSuggestion, scanPatterns } from '#shared/utils/scanner';
import { ScanContext } from '#shared/utils/scanContext';
import { summarizeSignalsByQuality } from '#shared/utils/signalQualitySummary';

export type AnalyzeMarketParams = {
  symbol: string;
  interval: IntervalEnum;
};

export async function analyzeMarket(params: AnalyzeMarketParams): Promise<AnalyzeResponse> {
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
  const suggestion = buildSuggestion(candles, patterns);
  const structure = getMarketStructure(candles, ctx.index, ctx.currentAtr);

  return {
    symbol: response.symbol,
    interval: response.interval,
    price: last?.close ?? null,
    updatedAt: last?.time ?? null,
    candles,
    suggestion,
    patterns,
    signalQualitySummary: summarizeSignalsByQuality(patterns),
    structure,
    disclaimer: 'common.disclaimer',
  };
}
