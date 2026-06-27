import { afterEach, describe, expect, it, vi } from 'vitest';
import { IntervalEnum, type Candle } from '#shared/types/market';
import { analyzeMarketWithCalibration } from '../../server/utils/analyzeMarketWithCalibration';

function makeCandles(): Candle[] {
  return Array.from({ length: 60 }, (_, index) => ({
    time: index + 1,
    open: 100,
    high: 105,
    low: 95,
    close: 100,
    volume: 1000,
  }));
}

describe('analyzeMarketWithCalibration', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns calibrated analysis response', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      candles: makeCandles(),
    }));

    const result = await analyzeMarketWithCalibration({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
    });

    expect(result.symbol).toBe('BTCUSDT');
    expect(result.interval).toBe(IntervalEnum.OneHour);
    expect(result.price).toBe(100);
    expect(result.updatedAt).toBe(60);
    expect(result.calibrationAdjustment).toBe(0);
    expect(result.disclaimer).toBe('common.disclaimer');
  });
});
