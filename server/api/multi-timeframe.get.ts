import type { MultiTimeframeResponse } from '#shared/types/market';
import { runMultiTimeframeAnalysis } from '../utils/multiTimeframeAnalysis';
import { normalizeTimeframeSummaryQuery } from '../utils/timeframeSummaryQuery';

export default defineEventHandler(async (event): Promise<MultiTimeframeResponse> => {
  const query = normalizeTimeframeSummaryQuery(getQuery(event));
  return runMultiTimeframeAnalysis(query);
});
