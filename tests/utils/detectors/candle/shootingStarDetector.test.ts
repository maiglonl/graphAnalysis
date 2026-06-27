import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { ShootingStarDetector } from '#shared/utils/detectors/candle/shootingStar';
import { ScanContext } from '#shared/utils/scanContext';
import { bearishPinBarCandles, earlyBearishPinBarCandles } from '../../../fixtures/candles/bearishPinBar';

describe('ShootingStarDetector', () => {
  it('detects shooting star after a bullish trend', () => {
    const signals = new ShootingStarDetector().detect(new ScanContext(bearishPinBarCandles()));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.ShootingStar,
      direction: PatternDirectionEnum.Bearish,
      entry: 160,
      stop: 170,
    });
  });

  it('ignores shooting-star shape outside a bullish trend', () => {
    const signals = new ShootingStarDetector().detect(new ScanContext(earlyBearishPinBarCandles()));

    expect(signals).toEqual([]);
  });
});
