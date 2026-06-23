import type { Candle } from "#shared/types/market";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const symbol = String(query.symbol || "BTCUSDT").toUpperCase();
  const interval = String(query.interval || "1h");
  const limit = Number(query.limit || 500);

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
