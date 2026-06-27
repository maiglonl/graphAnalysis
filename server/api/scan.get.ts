import { type AnalyzeResponse, type ScanListResponse } from '#shared/types/market';
import { analyzeMarket } from '../utils/analyzeMarket';
import { normalizeScanQuery } from '../utils/scanQuery';

export default defineEventHandler(async (event): Promise<ScanListResponse> => {
  const query = normalizeScanQuery(getQuery(event));
  const items: AnalyzeResponse[] = [];

  for (const symbol of query.symbols) {
    items.push(await analyzeMarket({ symbol, interval: query.interval }));
  }

  return {
    interval: query.interval,
    items: items.sort((a, b) => b.suggestion.confidence - a.suggestion.confidence),
  };
});
