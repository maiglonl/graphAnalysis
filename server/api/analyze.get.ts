import type { Candle } from "#shared/types/market";
import { DEFAULT_INTERVAL, DEFAULT_SYMBOL, IntervalEnum } from "#shared/types/market";
import { API } from "#shared/utils/detectors/constants";
import { getMarketStructure } from "#shared/utils/marketStructure";
import { buildSuggestion, scanPatterns } from "#shared/utils/scanner";
import { ScanContext } from "#shared/utils/scanContext";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const symbol = String(query.symbol || DEFAULT_SYMBOL).toUpperCase();

  const validIntervals = Object.values(IntervalEnum) as string[];
  const interval: IntervalEnum = validIntervals.includes(String(query.interval))
    ? (query.interval as IntervalEnum)
    : DEFAULT_INTERVAL;

  const response = await $fetch<{ symbol: string; interval: IntervalEnum; candles: Candle[] }>("/api/candles", {
    query: {
      symbol,
      interval,
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
    structure,
    disclaimer: "common.disclaimer",
  };
});
