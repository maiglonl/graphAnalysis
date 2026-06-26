import { BinanceProvider } from './BinanceProvider';
import type { MarketDataProvider } from './MarketDataProvider';

export const marketDataProvider: MarketDataProvider = new BinanceProvider();
