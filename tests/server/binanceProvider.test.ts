import { afterEach, describe, expect, it, vi } from 'vitest';
import { IntervalEnum, MarketDataErrorCodeEnum } from '#shared/types/market';
import { BinanceProvider } from '../../server/utils/marketData/BinanceProvider';

const params = {
  symbol: 'BTCUSDT',
  interval: IntervalEnum.OneHour,
  limit: 500,
};

describe('BinanceProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches and normalizes binance klines', async () => {
    const fetchMock = vi.fn().mockResolvedValue([
      [1000, '100', '110', '90', '105', '123.45', 2000, '0', 10, '0', '0', '0'],
    ]);
    vi.stubGlobal('$fetch', fetchMock);

    const candles = await new BinanceProvider().getCandles(params);

    expect(fetchMock).toHaveBeenCalledWith('https://api.binance.com/api/v3/klines', {
      query: params,
    });
    expect(candles).toEqual([
      {
        time: 1000,
        open: 100,
        high: 110,
        low: 90,
        close: 105,
        volume: 123.45,
      },
    ]);
  });

  it('throws empty response error when provider returns no klines', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue([]));

    await expect(new BinanceProvider().getCandles(params)).rejects.toMatchObject({
      code: MarketDataErrorCodeEnum.EmptyResponse,
      statusCode: 502,
    });
  });

  it('normalizes invalid symbol errors', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue({ statusCode: 400 }));

    await expect(new BinanceProvider().getCandles(params)).rejects.toMatchObject({
      code: MarketDataErrorCodeEnum.InvalidSymbol,
      statusCode: 400,
    });
  });

  it('normalizes timeout errors from response status', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue({ response: { status: 504 } }));

    await expect(new BinanceProvider().getCandles(params)).rejects.toMatchObject({
      code: MarketDataErrorCodeEnum.Timeout,
      statusCode: 504,
    });
  });

  it('normalizes rate limit errors', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue({ statusCode: 429 }));

    await expect(new BinanceProvider().getCandles(params)).rejects.toMatchObject({
      code: MarketDataErrorCodeEnum.RateLimited,
      statusCode: 429,
    });
  });
});
