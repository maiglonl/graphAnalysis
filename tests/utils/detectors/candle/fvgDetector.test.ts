import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { BearishFvgDetector } from '#shared/utils/detectors/candle/bearishFvg';
import { BullishFvgDetector } from '#shared/utils/detectors/candle/bullishFvg';
import { ScanContext } from '#shared/utils/scanContext';
import { bearishFvgCandles, bullishFvgCandles, unconfirmedBullishFvgCandles } from '../../../fixtures/candles/fvg';

describe('FVG detectors', () => {
  it('detects bullish FVG between first and third candles', () => {
    const signals = new BullishFvgDetector().detect(new ScanContext(bullishFvgCandles()));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.BullishFvg,
      direction: PatternDirectionEnum.Bullish,
      entry: 102.5,
      meta: {
        gapStart: 100,
        gapEnd: 105,
        gapSize: 5,
        fromTime: 58,
        toTime: 60,
      },
    });
  });

  it('detects bearish FVG between first and third candles', () => {
    const signals = new BearishFvgDetector().detect(new ScanContext(bearishFvgCandles()));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.BearishFvg,
      direction: PatternDirectionEnum.Bearish,
      entry: 97.5,
      meta: {
        gapStart: 95,
        gapEnd: 100,
        gapSize: 5,
        fromTime: 58,
        toTime: 60,
      },
    });
  });

  it('ignores FVG when the middle candle does not confirm direction', () => {
    const signals = new BullishFvgDetector().detect(new ScanContext(unconfirmedBullishFvgCandles()));

    expect(signals).toEqual([]);
  });
});
