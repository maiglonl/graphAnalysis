import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { ShootingStarDetector } from '#shared/utils/detectors/candle/shootingStar';
import { ScanContext } from '#shared/utils/scanContext';
import { bullishTrendCandles, withLastCandle } from '../../../fixtures/candles/factories';

describe('ShootingStarDetector', () => {
  it('detects shooting star after a bullish trend', () => {
    const candles = withLastCandle(
      bullishTrendCandles(59),
      { time: 60, open: 160.2, high: 170, low: 160, close: 160, volume: 1500 },
    );

    const signals = new ShootingStarDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.ShootingStar,
      direction: PatternDirectionEnum.Bearish,
      entry: 160,
      stop: 170,
    });
  });

  it('ignores shooting-star shape outside a bullish trend', () => {
    const candles = withLastCandle(
      bullishTrendCandles(10),
      { time: 11, open: 160.2, high: 170, low: 160, close: 160, volume: 1500 },
    );

    const signals = new ShootingStarDetector().detect(new ScanContext(candles));

    expect(signals).toEqual([]);
  });
});
