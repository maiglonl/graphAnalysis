import { describe, expect, it, vi } from 'vitest';
import { IntervalEnum, type Candle } from '#shared/types/market';
import { runHistoricalTimeframeSummary } from '../../server/utils/historicalTimeframeSummary';

function makeCandles(): Candle[] {
  return [
    ...Array.from({ length: 51 }, (_, index) => ({
      time: index + 1,
      open: 100,
      high: 105,
      low: 95,
      close: 100,
      volume: 1000,
    })),
    { time: 52, open: 100, high: 105, low: 95, close: 100, volume: 1000 },
  ];
}

describe('historical timeframe summary', () => {
  it('runs historical simulation for each requested timeframe', async () => {
    const loadCandles = vi.fn(async ({ symbol, interval }) => ({
      symbol,
      interval,
      candles: makeCandles(),
    }));

    const result = await runHistoricalTimeframeSummary({
      symbol: 'BTCUSDT',
      intervals: [IntervalEnum.OneHour, IntervalEnum.FourHours],
      loadCandles,
    });

    expect(loadCandles).toHaveBeenCalledTimes(2);
    expect(loadCandles).toHaveBeenNthCalledWith(1, { symbol: 'BTCUSDT', interval: IntervalEnum.OneHour });
    expect(loadCandles).toHaveBeenNthCalledWith(2, { symbol: 'BTCUSDT', interval: IntervalEnum.FourHours });
    expect(result.symbol).toBe('BTCUSDT');
    expect(result.items.map((item) => item.interval)).toEqual([IntervalEnum.OneHour, IntervalEnum.FourHours]);
  });
});
