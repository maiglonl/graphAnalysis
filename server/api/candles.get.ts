import type { Candle } from "#shared/types/market";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const allowedIntervals = new Set([
    "1m",
    "5m",
    "15m",
    "30m",
    "1h",
    "4h",
    "1d",
  ]);

  const limit = Math.min(Math.max(Number(query.limit || 500), 50), 1000);
  const interval = String(query.interval || "1h");
  const symbol = String(query.symbol || "BTCUSDT")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (!allowedIntervals.has(interval)) {
    throw createError({ statusCode: 400, message: "Timeframe inválido." });
  }

  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const raw = await $fetch<any[]>(url);

  const candles: Candle[] = raw.map((item) => ({
    time: Number(item[0]),
    open: Number(item[1]),
    high: Number(item[2]),
    low: Number(item[3]),
    close: Number(item[4]),
    volume: Number(item[5]),
  }));

  return {
    symbol,
    interval,
    candles,
  };
});
