import { DEFAULT_INTERVAL, DEFAULT_SYMBOL, IntervalEnum } from '#shared/types/market';

const MAX_SYMBOLS_PER_SCAN = 10;

export type NormalizedScanQuery = {
  interval: IntervalEnum;
  symbols: string[];
};

export function normalizeScanQuery(query: Record<string, unknown>): NormalizedScanQuery {
  const validIntervals = Object.values(IntervalEnum) as string[];
  const interval: IntervalEnum = validIntervals.includes(String(query.interval))
    ? (query.interval as IntervalEnum)
    : DEFAULT_INTERVAL;

  return {
    interval,
    symbols: parseSymbols(query.symbols || query.symbol || DEFAULT_SYMBOL),
  };
}

function parseSymbols(value: unknown): string[] {
  return String(value)
    .split(',')
    .map((symbol) => symbol.toUpperCase().replace(/[^A-Z0-9]/g, ''))
    .filter(Boolean)
    .slice(0, MAX_SYMBOLS_PER_SCAN);
}
