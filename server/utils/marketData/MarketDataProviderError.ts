import { MarketDataErrorCodeEnum } from '#shared/types/market';

export class MarketDataProviderError extends Error {
  readonly code: MarketDataErrorCodeEnum;
  readonly statusCode: number;

  constructor(code: MarketDataErrorCodeEnum, statusCode = 502) {
    super(code);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function isMarketDataProviderError(error: unknown): error is MarketDataProviderError {
  return error instanceof MarketDataProviderError;
}
