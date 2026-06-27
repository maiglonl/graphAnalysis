import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { ShootingStarDetector } from '#shared/utils/detectors/candle/shootingStar';
import { ScanContext } from '#shared/utils/scanContext';
import { earlyShootingStarCandles, shootingStarCandles } from '../../../fixtures/candles/shootingStar';

describe('ShootingStarDetector', () => {
  it('detects shooting star after a bullish trend', () => {
    const signals = new ShootingStarDetector().detect(new ScanContext(shootingStarCandles()));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.ShootingStar,
      direction: PatternDirectionEnum.Bearish,
      entry: 160,
      stop: 170,
    });
  });

  it('ignores shooting-star shape outside a bullish trend', () => {
    const signals = new ShootingStarDetector().detect(new ScanContext(earlyShootingStarCandles()));

    expect(signals).toEqual([]);
  });
});
