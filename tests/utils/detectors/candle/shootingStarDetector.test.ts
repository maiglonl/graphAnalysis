import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum, type Candle } from '#shared/types/market';
import { ShootingStarDetector } from '#shared/utils/detectors/candle/shootingStar';
import { ScanContext } from '#shared/utils/scanContext';

function bullishCandles(count: number): Candle[] {
  return Array.from({ length: count }, (_, index) => {
    const close = 100 + index;

    return {
      time: index + 1,
      open: close - 0.5,
      high: close + 1,
      low: close - 1,
      close,
      volume: 1000,
    };
  });
}

describe('ShootingStarDetector', () => {
  it('detects shooting star after a bullish trend', () => {
    const candles = [
      ...bullishCandles(59),
      { time: 60, open: 160, high: 170, low: 159.8, close: 159.9, volume: 1500 },
    ];

    const signals = new ShootingStarDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.ShootingStar,
      direction: PatternDirectionEnum.Bearish,
      entry: 159.8,
      stop: 170,
    });
  });

  it('ignores shooting-star shape outside a bullish trend', () => {
    const candles = [
      ...bullishCandles(10),
      { time: 11, open: 160, high: 170, low: 159.8, close: 159.9, volume: 1500 },
    ];

    const signals = new ShootingStarDetector().detect(new ScanContext(candles));

    expect(signals).toEqual([]);
  });
});
