import type { Candle } from "#shared/types/market";
import { DEFAULT_INTERVAL, DEFAULT_SYMBOL, IntervalEnum } from "#shared/types/market";
import { buildSuggestion, scanPatterns } from "#shared/utils/scanner";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const symbol = String(query.symbol || DEFAULT_SYMBOL).toUpperCase();

  const validIntervals = Object.values(IntervalEnum) as string[];
  const interval: IntervalEnum = validIntervals.includes(String(query.interval))
    ? (query.interval as IntervalEnum)
    : DEFAULT_INTERVAL;

  const response = await $fetch<{ candles: Candle[] }>("/api/candles", {
    query: {
      symbol,
      interval,
      limit: 500,
    },
  });

  const candles = response.candles;
  const last = candles.at(-1);

  const patterns = scanPatterns(candles);
  const suggestion = buildSuggestion(candles, patterns);

  return {
    symbol,
    interval,
    price: last?.close ?? null,
    updatedAt: last?.time ?? null,
    candles,
    suggestion,
    patterns,
    disclaimer: "common.disclaimer",
  };
});
