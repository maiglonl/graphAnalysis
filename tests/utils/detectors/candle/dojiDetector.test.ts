import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { DojiDetector } from '#shared/utils/detectors/candle/doji';
import { ScanContext } from '#shared/utils/scanContext';
import { dojiCandles, nonDojiCandles } from '../../../fixtures/candles/doji';

describe('DojiDetector', () => {
  it('detects a neutral doji candle', () => {
    const signals = new DojiDetector().detect(new ScanContext(dojiCandles()));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.Doji,
      direction: PatternDirectionEnum.Neutral,
      price: 100.5,
    });
  });

  it('ignores a regular candle', () => {
    const signals = new DojiDetector().detect(new ScanContext(nonDojiCandles()));

    expect(signals).toEqual([]);
  });
});
