import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { InsideBarDetector } from '#shared/utils/detectors/candle/insideBar';
import { ScanContext } from '#shared/utils/scanContext';
import { insideBarCandles, outsideMotherRangeCandles } from '../../../fixtures/candles/insideBar';

describe('InsideBarDetector', () => {
  it('detects an inside bar contained within the mother candle', () => {
    const signals = new InsideBarDetector().detect(new ScanContext(insideBarCandles()));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.InsideBar,
      direction: PatternDirectionEnum.Neutral,
      entry: 110,
      stop: 90,
    });
  });

  it('ignores candles that break the mother candle range', () => {
    const signals = new InsideBarDetector().detect(new ScanContext(outsideMotherRangeCandles()));

    expect(signals).toEqual([]);
  });
});
