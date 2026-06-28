import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { BullishFlagDetector } from '#shared/utils/detectors/priceAction/bullishFlag';
import { BearishFlagDetector } from '#shared/utils/detectors/priceAction/bearishFlag';
import { BullishPennantDetector } from '#shared/utils/detectors/priceAction/bullishPennant';
import { BearishPennantDetector } from '#shared/utils/detectors/priceAction/bearishPennant';
import { ScanContext } from '#shared/utils/scanContext';
import { bullishTrendCandles, bearishTrendCandles } from '../../../fixtures/candles/factories';
import type { Candle } from '#shared/types/market';

function bullishConsolidation(): Candle[] {
  return [
    { time: 52, open: 151, high: 152.5, low: 150, close: 151, volume: 1000 },
    { time: 53, open: 151, high: 153, low: 150, close: 152, volume: 1000 },
    { time: 54, open: 152, high: 152.5, low: 150, close: 151, volume: 1000 },
    { time: 55, open: 151, high: 152, low: 150, close: 151, volume: 1000 },
    { time: 56, open: 151, high: 153, low: 150, close: 152, volume: 1000 },
    { time: 57, open: 152, high: 152.5, low: 150, close: 151, volume: 1000 },
    { time: 58, open: 151, high: 152, low: 150, close: 151.5, volume: 1000 },
    { time: 59, open: 151.5, high: 153, low: 150, close: 152, volume: 1000 },
  ];
}

function bearishConsolidation(): Candle[] {
  return [
    { time: 52, open: 149, high: 150, low: 147, close: 149, volume: 1000 },
    { time: 53, open: 149, high: 150, low: 147, close: 148, volume: 1000 },
    { time: 54, open: 148, high: 150, low: 147.5, close: 149, volume: 1000 },
    { time: 55, open: 149, high: 150, low: 147, close: 148, volume: 1000 },
    { time: 56, open: 148, high: 149.5, low: 147, close: 149, volume: 1000 },
    { time: 57, open: 149, high: 150, low: 147, close: 148, volume: 1000 },
    { time: 58, open: 148, high: 149.5, low: 147, close: 148.5, volume: 1000 },
    { time: 59, open: 148.5, high: 150, low: 147, close: 148, volume: 1000 },
  ];
}

describe('continuation breakout detectors', () => {
  it('detects BullishFlag after uptrend and breakout above consolidation', () => {
    const candles = [
      ...bullishTrendCandles(51),
      ...bullishConsolidation(),
      { time: 60, open: 153, high: 157, low: 152.5, close: 156, volume: 1200 },
    ];

    const signals = new BullishFlagDetector().detect(new ScanContext(candles));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.BullishFlag,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('detects BearishFlag after downtrend and breakout below consolidation', () => {
    const candles = [
      ...bearishTrendCandles(51),
      ...bearishConsolidation(),
      { time: 60, open: 147, high: 147.5, low: 143, close: 144, volume: 1200 },
    ];

    const signals = new BearishFlagDetector().detect(new ScanContext(candles));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.BearishFlag,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('detects BullishPennant with range compression and breakout above', () => {
    const candles = [
      ...bullishTrendCandles(51),
      // First 4 candles: wider range 150-156
      { time: 52, open: 151, high: 156, low: 150, close: 153, volume: 1000 },
      { time: 53, open: 153, high: 155, low: 150, close: 154, volume: 1000 },
      { time: 54, open: 154, high: 156, low: 151, close: 151, volume: 1000 },
      { time: 55, open: 151, high: 155, low: 150, close: 153, volume: 1000 },
      // Second 4 candles: compressed range 151-153
      { time: 56, open: 152, high: 153, low: 151, close: 152, volume: 1000 },
      { time: 57, open: 152, high: 153, low: 151, close: 151.5, volume: 1000 },
      { time: 58, open: 151.5, high: 152.5, low: 151, close: 152, volume: 1000 },
      { time: 59, open: 152, high: 153, low: 151, close: 151.5, volume: 1000 },
      // Breakout above rangeHigh (156):
      { time: 60, open: 156, high: 161, low: 155.5, close: 159, volume: 1200 },
    ];

    const signals = new BullishPennantDetector().detect(new ScanContext(candles));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.BullishPennant,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('detects BearishPennant with range compression and breakout below', () => {
    const candles = [
      ...bearishTrendCandles(51),
      // First 4 candles: wider range 144-150
      { time: 52, open: 149, high: 150, low: 144, close: 147, volume: 1000 },
      { time: 53, open: 147, high: 150, low: 145, close: 146, volume: 1000 },
      { time: 54, open: 146, high: 149, low: 144, close: 149, volume: 1000 },
      { time: 55, open: 149, high: 150, low: 145, close: 147, volume: 1000 },
      // Second 4 candles: compressed range 147-149
      { time: 56, open: 148, high: 149, low: 147, close: 148, volume: 1000 },
      { time: 57, open: 148, high: 149, low: 147, close: 147.5, volume: 1000 },
      { time: 58, open: 147.5, high: 148.5, low: 147, close: 148, volume: 1000 },
      { time: 59, open: 148, high: 149, low: 147, close: 147.5, volume: 1000 },
      // Breakout below rangeLow (144):
      { time: 60, open: 144, high: 144.5, low: 140, close: 141, volume: 1200 },
    ];

    const signals = new BearishPennantDetector().detect(new ScanContext(candles));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.BearishPennant,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('ignores pennant when range is not compressing', () => {
    const candles = [
      ...bullishTrendCandles(51),
      // All 8 candles with identical range (no compression)
      { time: 52, open: 151, high: 153, low: 150, close: 151, volume: 1000 },
      { time: 53, open: 151, high: 153, low: 150, close: 152, volume: 1000 },
      { time: 54, open: 152, high: 153, low: 150, close: 151, volume: 1000 },
      { time: 55, open: 151, high: 153, low: 150, close: 151, volume: 1000 },
      { time: 56, open: 151, high: 153, low: 150, close: 152, volume: 1000 },
      { time: 57, open: 152, high: 153, low: 150, close: 151, volume: 1000 },
      { time: 58, open: 151, high: 153, low: 150, close: 151.5, volume: 1000 },
      { time: 59, open: 151.5, high: 153, low: 150, close: 152, volume: 1000 },
      // Would-be breakout:
      { time: 60, open: 153, high: 157, low: 152.5, close: 156, volume: 1200 },
    ];

    const signals = new BullishPennantDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(0);
  });

  it('ignores flag when current close does not break above consolidation', () => {
    const candles = [
      ...bullishTrendCandles(51),
      ...bullishConsolidation(),
      // Last candle stays within the range
      { time: 60, open: 152, high: 153, low: 150, close: 152, volume: 1000 },
    ];

    const signals = new BullishFlagDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(0);
  });
});
