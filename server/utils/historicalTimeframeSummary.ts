import { type Candle, type HistoricalSimulationResult, type IntervalEnum } from '#shared/types/market';
import { API } from '#shared/utils/detectors/constants';
import { runHistoricalSimulation } from './historicalSimulation';

export type HistoricalTimeframeSummaryResponse = {
  symbol: string;
  items: HistoricalSimulationResult[];
};

export type LoadHistoricalCandlesParams = {
  symbol: string;
  interval: IntervalEnum;
};

export type HistoricalCandlesResponse = {
  symbol: string;
  interval: IntervalEnum;
  candles: Candle[];
};

export type LoadHistoricalCandles = (params: LoadHistoricalCandlesParams) => Promise<HistoricalCandlesResponse>;

export type RunHistoricalTimeframeSummaryParams = {
  symbol: string;
  intervals: IntervalEnum[];
  loadCandles?: LoadHistoricalCandles;
};

export async function runHistoricalTimeframeSummary(
  params: RunHistoricalTimeframeSummaryParams,
): Promise<HistoricalTimeframeSummaryResponse> {
  const loadCandles = params.loadCandles ?? defaultLoadCandles;
  const items: HistoricalSimulationResult[] = [];

  for (const interval of params.intervals) {
    const response = await loadCandles({ symbol: params.symbol, interval });

    items.push(runHistoricalSimulation({
      symbol: response.symbol,
      interval: response.interval,
      candles: response.candles,
    }));
  }

  return {
    symbol: params.symbol,
    items,
  };
}

async function defaultLoadCandles(params: LoadHistoricalCandlesParams): Promise<HistoricalCandlesResponse> {
  return $fetch<HistoricalCandlesResponse>('/api/candles', {
    query: {
      symbol: params.symbol,
      interval: params.interval,
      limit: API.candleLimit,
    },
  });
}
