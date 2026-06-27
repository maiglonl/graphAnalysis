import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { BearishThreeCandleReversalDetector } from '#shared/utils/detectors/candle/bearishThreeCandleReversal';
import { BullishThreeCandleReversalDetector } from '#shared/utils/detectors/candle/bullishThreeCandleReversal';
import { TweezerBottomDetector } from '#shared/utils/detectors/candle/tweezerBottom';
import { TweezerTopDetector } from '#shared/utils/detectors/candle/tweezerTop';
import { ScanContext } from '#shared/utils/scanContext';
import { bearishTrendCandles, bullishTrendCandles } from '../../../fixtures/candles/factories';

describe('three candle and tweezer detectors', () => {
  it('detects bullish three candle reversal after a bearish trend', () => {
    const candles = [
      ...bearishTrendCandles(57),
      { time: 58, open: 145, high: 146, low: 134, close: 135, volume: 1500 },
      { time: 59, open: 136, high: 138, low: 133, close: 136.2, volume: 1200 },
      { time: 60, open: 137, high: 148, low: 136, close: 143, volume: 1600 },
    ];

    const signals = new BullishThreeCandleReversalDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.MorningStar,
      direction: PatternDirectionEnum.Bullish,
      entry: 148,
      stop: 133,
    });
  });

  it('detects bearish three candle reversal after a bullish trend', () => {
    const candles = [
      ...bullishTrendCandles(57),
      { time: 58, open: 155, high: 166, low: 154, close: 165, volume: 1500 },
      { time: 59, open: 164, high: 167, low: 163, close: 164.2, volume: 1200 },
      { time: 60, open: 163, high: 164, low: 150, close: 157, volume: 1600 },
    ];

    const signals = new BearishThreeCandleReversalDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.EveningStar,
      direction: PatternDirectionEnum.Bearish,
      entry: 150,
      stop: 167,
    });
  });

  it('detects tweezer bottom after a bearish trend', () => {
    const candles = [
      ...bearishTrendCandles(58),
      { time: 59, open: 145, high: 146, low: 135, close: 136, volume: 1500 },
      { time: 60, open: 136, high: 144, low: 135.05, close: 143, volume: 1500 },
    ];

    const signals = new TweezerBottomDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.TweezerBottom,
      direction: PatternDirectionEnum.Bullish,
      entry: 146,
      stop: 135,
    });
  });

  it('detects tweezer top after a bullish trend', () => {
    const candles = [
      ...bullishTrendCandles(58),
      { time: 59, open: 155, high: 165, low: 154, close: 164, volume: 1500 },
      { time: 60, open: 164, high: 165.05, low: 156, close: 157, volume: 1500 },
    ];

    const signals = new TweezerTopDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.TweezerTop,
      direction: PatternDirectionEnum.Bearish,
      entry: 154,
      stop: 165.05,
    });
  });
});
