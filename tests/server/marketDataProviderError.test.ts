import { describe, expect, it } from 'vitest';
import { MarketDataErrorCodeEnum } from '#shared/types/market';
import { isMarketDataProviderError, MarketDataProviderError } from '../../server/utils/marketData/MarketDataProviderError';

describe('MarketDataProviderError', () => {
  it('stores error code and status code', () => {
    const error = new MarketDataProviderError(MarketDataErrorCodeEnum.RateLimited, 429);

    expect(error.message).toBe(MarketDataErrorCodeEnum.RateLimited);
    expect(error.code).toBe(MarketDataErrorCodeEnum.RateLimited);
    expect(error.statusCode).toBe(429);
  });

  it('uses provider unavailable status by default', () => {
    const error = new MarketDataProviderError(MarketDataErrorCodeEnum.ProviderUnavailable);

    expect(error.statusCode).toBe(502);
  });

  it('identifies provider errors', () => {
    const error = new MarketDataProviderError(MarketDataErrorCodeEnum.Timeout, 504);

    expect(isMarketDataProviderError(error)).toBe(true);
    expect(isMarketDataProviderError(new Error('timeout'))).toBe(false);
  });
});
