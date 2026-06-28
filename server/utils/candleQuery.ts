import { DEFAULT_INTERVAL, DEFAULT_SYMBOL, IntervalEnum, MarketDataErrorCodeEnum } from '#shared/types/market';
import { API } from '#shared/utils/detectors/constants';

const ALLOWED_INTERVALS = new Set<string>(Object.values(IntervalEnum));

export type NormalizedCandleQuery =
  | {
      ok: true;
      symbol: string;
      interval: IntervalEnum;
      limit: number;
    }
  | {
      ok: false;
      errorCode: MarketDataErrorCodeEnum;
    };

export function normalizeCandleQuery(query: Record<string, unknown>): NormalizedCandleQuery {
  const rawLimit = Number(query.limit || API.candleLimit);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, API.candleLimitMin), API.candleLimitMax)
    : API.candleLimit;

  const rawInterval = String(query.interval || DEFAULT_INTERVAL);
  const interval = ALLOWED_INTERVALS.has(rawInterval) ? (rawInterval as IntervalEnum) : null;
  const symbol = String(query.symbol || DEFAULT_SYMBOL)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  if (!symbol) return { ok: false, errorCode: MarketDataErrorCodeEnum.InvalidSymbol };
  if (!interval) return { ok: false, errorCode: MarketDataErrorCodeEnum.InvalidInterval };

  return {
    ok: true,
    symbol,
    interval,
    limit,
  };
}
