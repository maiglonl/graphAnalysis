import type { Candle, IntervalEnum } from '#shared/types/market';

export type GetCandlesParams = {
  symbol: string;
  interval: IntervalEnum;
  limit: number;
};

export interface MarketDataProvider {
  getCandles(params: GetCandlesParams): Promise<Candle[]>;
}
