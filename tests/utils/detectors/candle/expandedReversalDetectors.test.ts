import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { BearishHaramiDetector } from '#shared/utils/detectors/candle/bearishHarami';
import { BullishHaramiDetector } from '#shared/utils/detectors/candle/bullishHarami';
import { HangingManDetector } from '#shared/utils/detectors/candle/hangingMan';
import { InvertedHammerDetector } from '#shared/utils/detectors/candle/invertedHammer';
import { ScanContext } from '#shared/utils/scanContext';
import { bearishTrendCandles, bullishTrendCandles, withLastCandle } from '../../../fixtures/candles/factories';

describe('expanded reversal candle detectors', () => {
  it('detects inverted hammer after a bearish trend', () => {
    const candles = withLastCandle(
      bearishTrendCandles(59),
      { time: 60, open: 140, high: 150, low: 140, close: 140.2, volume: 1500 },
    );

    const signals = new InvertedHammerDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.InvertedHammer,
      direction: PatternDirectionEnum.Bullish,
      entry: 150,
      stop: 140,
    });
  });

  it('detects hanging man after a bullish trend', () => {
    const candles = withLastCandle(
      bullishTrendCandles(59),
      { time: 60, open: 160.2, high: 160.2, low: 150, close: 160, volume: 1500 },
    );

    const signals = new HangingManDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.HangingMan,
      direction: PatternDirectionEnum.Bearish,
      entry: 150,
      stop: 160.2,
    });
  });

  it('detects bullish harami after a bearish trend', () => {
    const candles = [
      ...bearishTrendCandles(58),
      { time: 59, open: 145, high: 146, low: 135, close: 136, volume: 1500 },
      { time: 60, open: 138, high: 143, low: 137, close: 142, volume: 1400 },
    ];

    const signals = new BullishHaramiDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.BullishHarami,
      direction: PatternDirectionEnum.Bullish,
      entry: 146,
      stop: 135,
    });
  });

  it('detects bearish harami after a bullish trend', () => {
    const candles = [
      ...bullishTrendCandles(58),
      { time: 59, open: 155, high: 166, low: 154, close: 165, volume: 1500 },
      { time: 60, open: 163, high: 164, low: 158, close: 159, volume: 1400 },
    ];

    const signals = new BearishHaramiDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.BearishHarami,
      direction: PatternDirectionEnum.Bearish,
      entry: 154,
      stop: 166,
    });
  });
});
