import { describe, expect, it } from 'vitest';
import { IntervalEnum, MarketDataErrorCodeEnum } from '#shared/types/market';
import { normalizeCandleQuery } from '../../server/utils/candleQuery';

describe('normalizeCandleQuery', () => {
  it('uses defaults for empty query', () => {
    expect(normalizeCandleQuery({})).toEqual({
      ok: true,
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      limit: 500,
    });
  });

  it('sanitizes symbol and normalizes interval and limit', () => {
    expect(normalizeCandleQuery({ symbol: ' eth-usdt ', interval: '4h', limit: '200' })).toEqual({
      ok: true,
      symbol: 'ETHUSDT',
      interval: IntervalEnum.FourHours,
      limit: 200,
    });
  });

  it('clamps limit to configured boundaries', () => {
    expect(normalizeCandleQuery({ limit: '10' })).toMatchObject({ ok: true, limit: 50 });
    expect(normalizeCandleQuery({ limit: '5000' })).toMatchObject({ ok: true, limit: 1000 });
  });

  it('returns invalid symbol error when sanitized symbol is empty', () => {
    expect(normalizeCandleQuery({ symbol: '!!!' })).toEqual({
      ok: false,
      errorCode: MarketDataErrorCodeEnum.InvalidSymbol,
    });
  });

  it('returns invalid interval error for unsupported intervals', () => {
    expect(normalizeCandleQuery({ interval: '2h' })).toEqual({
      ok: false,
      errorCode: MarketDataErrorCodeEnum.InvalidInterval,
    });
  });
});
