import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { AtrCompressionDetector } from '#shared/utils/detectors/volatility/atrCompression';
import { AtrExpansionBreakoutDetector } from '#shared/utils/detectors/volatility/atrExpansionBreakout';
import { CompressionSqueezeDetector } from '#shared/utils/detectors/volatility/compressionSqueeze';
import { WideRangeCandleDetector } from '#shared/utils/detectors/volatility/wideRangeCandle';
import { ScanContext } from '#shared/utils/scanContext';
import { flatCandles, narrowFlatCandles, withLastCandle } from '../../../fixtures/candles/factories';

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
    const signals = new AtrCompressionDetector().detect(new ScanContext([
      ...flatCandles(59),
      { time: 60, open: 100, high: 100.5, low: 99.5, close: 100, volume: 1000 },
    ]));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.AtrCompression,
      direction: PatternDirectionEnum.Neutral,
    });
  });

  it('detects volatility squeeze', () => {
    const signals = new CompressionSqueezeDetector().detect(new ScanContext(narrowFlatCandles(60)));

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
