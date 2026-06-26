import type { Candle } from '#shared/types/market';
import type { GetCandlesParams, MarketDataProvider } from './MarketDataProvider';

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

export class BinanceProvider implements MarketDataProvider {
  async getCandles(params: GetCandlesParams): Promise<Candle[]> {
    const raw = await $fetch<BinanceKline[]>('https://api.binance.com/api/v3/klines', {
      query: {
        symbol: params.symbol,
        interval: params.interval,
        limit: params.limit,
      },
    });

    return raw.map((item) => ({
      time: Number(item[0]),
      open: Number(item[1]),
      high: Number(item[2]),
      low: Number(item[3]),
      close: Number(item[4]),
      volume: Number(item[5]),
    }));
  }
}
