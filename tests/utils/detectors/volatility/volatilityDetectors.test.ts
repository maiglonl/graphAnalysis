import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { AtrCompressionDetector } from '#shared/utils/detectors/volatility/atrCompression';
import { AtrExpansionBreakoutDetector } from '#shared/utils/detectors/volatility/atrExpansionBreakout';
import { VolatilitySqueezeDetector } from '#shared/utils/detectors/volatility/volatilitySqueeze';
import { WideRangeCandleDetector } from '#shared/utils/detectors/volatility/wideRangeCandle';
import { ScanContext } from '#shared/utils/scanContext';
import { narrowFlatCandles, withLastCandle } from '../../../fixtures/candles/factories';

describe('volatility detectors', () => {
  it('detects atr expansion breakout', () => {
    const signals = new AtrExpansionBreakoutDetector().detect(new ScanContext(withLastCandle(
      narrowFlatCandles(59),
      { time: 60, open: 101, high: 130, low: 100, close: 128, volume: 1500 },
    )));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.AtrExpansionBreakout,
      direction: PatternDirectionEnum.Bullish,
    });
  });

  it('detects atr compression', () => {
    // Wide candles first (high ATR, range=30), then 14 narrow candles (low ATR, range=2).
    // ATR uses SMA(14): currentAtr window (all narrow) = 2, referenceAtr at idx-14 window (all wide) = 30.
    // Ratio = 2/30 ≈ 0.067 < atrCompressionRatioMax (0.75) → signal fires.
    const wideCandles = Array.from({ length: 40 }, (_, i) => ({
      time: i + 1, open: 100, high: 115, low: 85, close: 100, volume: 1000,
    }));
    const narrowCandles = Array.from({ length: 14 }, (_, i) => ({
      time: 41 + i, open: 100, high: 101, low: 99, close: 100, volume: 1000,
    }));

    const signals = new AtrCompressionDetector().detect(new ScanContext([...wideCandles, ...narrowCandles]));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.AtrCompression,
      direction: PatternDirectionEnum.Neutral,
    });
  });

  it('detects volatility squeeze', () => {
    const signals = new VolatilitySqueezeDetector().detect(new ScanContext(narrowFlatCandles(60)));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.VolatilitySqueeze,
      direction: PatternDirectionEnum.Neutral,
    });
  });

  it('detects wide range candles', () => {
    const signals = new WideRangeCandleDetector().detect(new ScanContext(withLastCandle(
      narrowFlatCandles(59),
      { time: 60, open: 100, high: 130, low: 90, close: 125, volume: 1200 },
    )));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.WideRangeCandle,
      direction: PatternDirectionEnum.Bullish,
    });
  });
});
