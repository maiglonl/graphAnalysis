import { DEFAULT_INTERVAL, DEFAULT_SYMBOL, IntervalEnum, type AnalyzeResponse, type ScanListResponse } from '#shared/types/market';
import { analyzeMarket } from '../utils/analyzeMarket';

const MAX_SYMBOLS_PER_SCAN = 10;

export default defineEventHandler(async (event): Promise<ScanListResponse> => {
  const query = getQuery(event);
  const validIntervals = Object.values(IntervalEnum) as string[];
  const interval: IntervalEnum = validIntervals.includes(String(query.interval))
    ? (query.interval as IntervalEnum)
    : DEFAULT_INTERVAL;

  const symbols = parseSymbols(query.symbols || query.symbol || DEFAULT_SYMBOL);
  const items: AnalyzeResponse[] = [];

  for (const symbol of symbols) {
    items.push(await analyzeMarket({ symbol, interval }));
  }

  return {
    interval,
    items: items.sort((a, b) => b.suggestion.confidence - a.suggestion.confidence),
  };
});

function parseSymbols(value: unknown): string[] {
  return String(value)
    .split(',')
    .map((symbol) => symbol.toUpperCase().replace(/[^A-Z0-9]/g, ''))
    .filter(Boolean)
    .slice(0, MAX_SYMBOLS_PER_SCAN);
}
