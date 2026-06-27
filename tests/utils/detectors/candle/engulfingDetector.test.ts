import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { BearishEngulfingDetector } from '#shared/utils/detectors/candle/bearishEngulfing';
import { BullishEngulfingDetector } from '#shared/utils/detectors/candle/bullishEngulfing';
import { ScanContext } from '#shared/utils/scanContext';
import { bearishEngulfingCandles, bullishEngulfingCandles } from '../../../fixtures/candles/engulfing';

describe('Engulfing detectors', () => {
  it('detects bullish engulfing after a bearish trend', () => {
    const signals = new BullishEngulfingDetector().detect(new ScanContext(bullishEngulfingCandles()));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.BullishEngulfing,
      direction: PatternDirectionEnum.Bullish,
      entry: 143,
      stop: 139,
    });
  });

  it('detects bearish engulfing after a bullish trend', () => {
    const signals = new BearishEngulfingDetector().detect(new ScanContext(bearishEngulfingCandles()));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.BearishEngulfing,
      direction: PatternDirectionEnum.Bearish,
      entry: 157,
      stop: 161,
    });
  });
});
