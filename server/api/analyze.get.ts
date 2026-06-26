import type { Candle } from "#shared/types/market";
import { buildSuggestion, scanPatterns } from "#shared/utils/scanner";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const symbol = String(query.symbol || "BTCUSDT").toUpperCase();
  const interval = String(query.interval || "1h");

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
    disclaimer:
      "Isto não é recomendação financeira. É uma leitura automatizada baseada em padrões técnicos.",
  };
});
