import type { Candle } from "#shared/types/market";
import { DEFAULT_SYMBOL, IntervalEnum } from "#shared/types/market";
import { API } from "#shared/utils/detectors/constants";

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

  const rawLimit = Number(query.limit || API.candleLimit);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, API.candleLimitMin), API.candleLimitMax)
    : API.candleLimit;

  const interval = String(query.interval || IntervalEnum.OneHour);
  const symbol = String(query.symbol || DEFAULT_SYMBOL)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (!symbol) {
    throw createError({ statusCode: 400, message: "errors.invalidSymbol" });
  }

  if (!ALLOWED_INTERVALS.has(interval)) {
    throw createError({ statusCode: 400, message: "errors.invalidInterval" });
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
