import type { AnalyzeResponse, MultiTimeframeResponse } from '#shared/types/market';
import { analyzeMarket } from './analyzeMarket';
import type { NormalizedTimeframeSummaryQuery } from './timeframeSummaryQuery';

export async function runMultiTimeframeAnalysis(
  query: NormalizedTimeframeSummaryQuery,
): Promise<MultiTimeframeResponse> {
  const items: AnalyzeResponse[] = [];

  for (const interval of query.intervals) {
    items.push(await analyzeMarket({ symbol: query.symbol, interval }));
  }

  return { symbol: query.symbol, items };
}
