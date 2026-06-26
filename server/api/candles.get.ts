import type { Candle } from "#shared/types/market";
import { IntervalEnum } from "#shared/types/market";

type BinanceKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
];

const ALLOWED_INTERVALS = new Set<string>(Object.values(IntervalEnum));

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const rawLimit = Number(query.limit || 500);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 50), 1000)
    : 500;

  const interval = String(query.interval || IntervalEnum.OneHour);
  const symbol = String(query.symbol || "BTCUSDT")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (!symbol) {
    throw createError({ statusCode: 400, message: "Ativo inválido." });
  }

  if (!ALLOWED_INTERVALS.has(interval)) {
    throw createError({ statusCode: 400, message: "Timeframe inválido." });
  }

  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const raw = await $fetch<BinanceKline[]>(url);

  const candles: Candle[] = raw.map((item) => ({
    time: Number(item[0]),
    open: Number(item[1]),
    high: Number(item[2]),
    low: Number(item[3]),
    close: Number(item[4]),
    volume: Number(item[5]),
  }));

  return { symbol, interval, candles };
});
