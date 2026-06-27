import { runHistoricalTimeframeSummary } from '../utils/historicalTimeframeSummary';
import { normalizeTimeframeSummaryQuery } from '../utils/timeframeSummaryQuery';

export default defineEventHandler(async (event) => {
  const query = normalizeTimeframeSummaryQuery(getQuery(event));

  return runHistoricalTimeframeSummary({
    symbol: query.symbol,
    intervals: query.intervals,
  });
});
