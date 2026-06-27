import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { DojiDetector } from '#shared/utils/detectors/candle/doji';
import { ScanContext } from '#shared/utils/scanContext';
import { flatCandles, withLastCandle } from '../../../fixtures/candles/factories';

describe('DojiDetector', () => {
  it('detects a neutral doji candle', () => {
    const candles = withLastCandle(
      flatCandles(59),
      { time: 60, open: 100, high: 110, low: 90, close: 100.5, volume: 1000 },
    );

    const signals = new DojiDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.Doji,
      direction: PatternDirectionEnum.Neutral,
      price: 100.5,
    });
  });

  it('ignores a regular candle', () => {
    const candles = withLastCandle(
      flatCandles(59),
      { time: 60, open: 100, high: 110, low: 90, close: 105, volume: 1000 },
    );

    const signals = new DojiDetector().detect(new ScanContext(candles));

    expect(signals).toEqual([]);
  });
});
