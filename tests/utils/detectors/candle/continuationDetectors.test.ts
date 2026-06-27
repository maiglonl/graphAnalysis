import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { BearishSeparatingLinesDetector } from '#shared/utils/detectors/candle/bearishSeparatingLines';
import { BullishSeparatingLinesDetector } from '#shared/utils/detectors/candle/bullishSeparatingLines';
import { FallingThreeMethodsDetector } from '#shared/utils/detectors/candle/fallingThreeMethods';
import { RisingThreeMethodsDetector } from '#shared/utils/detectors/candle/risingThreeMethods';
import { ScanContext } from '#shared/utils/scanContext';
import { bearishTrendCandles, bullishTrendCandles } from '../../../fixtures/candles/factories';

describe('continuation candle detectors', () => {
  it('detects rising three methods', () => {
    const candles = [
      ...bullishTrendCandles(55),
      { time: 56, open: 155, high: 166, low: 154, close: 165, volume: 1000 },
      { time: 57, open: 164, high: 165, low: 160, close: 162, volume: 900 },
      { time: 58, open: 162, high: 164, low: 159, close: 161, volume: 900 },
      { time: 59, open: 161, high: 163, low: 158, close: 160, volume: 900 },
      { time: 60, open: 160, high: 169, low: 159, close: 168, volume: 1200 },
    ];

    const signals = new RisingThreeMethodsDetector().detect(new ScanContext(candles));

    expect(signals[0]).toMatchObject({ id: PatternIdEnum.RisingThreeMethods, direction: PatternDirectionEnum.Bullish });
  });

  it('detects falling three methods', () => {
    const candles = [
      ...bearishTrendCandles(55),
      { time: 56, open: 165, high: 166, low: 154, close: 155, volume: 1000 },
      { time: 57, open: 156, high: 161, low: 155, close: 158, volume: 900 },
      { time: 58, open: 158, high: 162, low: 156, close: 159, volume: 900 },
      { time: 59, open: 159, high: 163, low: 157, close: 160, volume: 900 },
      { time: 60, open: 160, high: 161, low: 150, close: 152, volume: 1200 },
    ];

    const signals = new FallingThreeMethodsDetector().detect(new ScanContext(candles));

    expect(signals[0]).toMatchObject({ id: PatternIdEnum.FallingThreeMethods, direction: PatternDirectionEnum.Bearish });
  });

  it('detects separating lines', () => {
    const bullishSignals = new BullishSeparatingLinesDetector().detect(new ScanContext([
      ...bullishTrendCandles(58),
      { time: 59, open: 160, high: 161, low: 154, close: 155, volume: 1000 },
      { time: 60, open: 160.05, high: 168, low: 159, close: 167, volume: 1000 },
    ]));
    const bearishSignals = new BearishSeparatingLinesDetector().detect(new ScanContext([
      ...bearishTrendCandles(58),
      { time: 59, open: 160, high: 166, low: 159, close: 165, volume: 1000 },
      { time: 60, open: 159.95, high: 160, low: 151, close: 152, volume: 1000 },
    ]));

    expect(bullishSignals[0]).toMatchObject({ id: PatternIdEnum.BullishSeparatingLines, direction: PatternDirectionEnum.Bullish });
    expect(bearishSignals[0]).toMatchObject({ id: PatternIdEnum.BearishSeparatingLines, direction: PatternDirectionEnum.Bearish });
  });
});
