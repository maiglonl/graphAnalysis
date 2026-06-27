import { type AnalyzeResponse, type MultiTimeframeResponse } from '#shared/types/market';
import { analyzeMarket } from '../utils/analyzeMarket';
import { normalizeTimeframeSummaryQuery } from '../utils/timeframeSummaryQuery';

export default defineEventHandler(async (event): Promise<MultiTimeframeResponse> => {
  const query = normalizeTimeframeSummaryQuery(getQuery(event));
  const items: AnalyzeResponse[] = [];

  for (const interval of query.intervals) {
    items.push(await analyzeMarket({ symbol: query.symbol, interval }));
  }

  return {
    symbol: query.symbol,
    items,
  };
});
