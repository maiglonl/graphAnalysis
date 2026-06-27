import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { BullishKickerDetector } from '#shared/utils/detectors/candle/bullishKicker';
import { BullishMarubozuDetector } from '#shared/utils/detectors/candle/bullishMarubozu';
import { DragonflyDojiDetector } from '#shared/utils/detectors/candle/dragonflyDoji';
import { GravestoneDojiDetector } from '#shared/utils/detectors/candle/gravestoneDoji';
import { LongLeggedDojiDetector } from '#shared/utils/detectors/candle/longLeggedDoji';
import { RedMarubozuDetector } from '#shared/utils/detectors/candle/redMarubozu';
import { SpinningTopDetector } from '#shared/utils/detectors/candle/spinningTop';
import { ThreeBlackCrowsDetector } from '#shared/utils/detectors/candle/threeBlackCrows';
import { ThreeWhiteSoldiersDetector } from '#shared/utils/detectors/candle/threeWhiteSoldiers';
import { BearishKickerDetector } from '#shared/utils/detectors/candle/bearishKicker';
import { ScanContext } from '#shared/utils/scanContext';
import { bearishTrendCandles, bullishTrendCandles, flatCandles, withLastCandle } from '../../../fixtures/candles/factories';

describe('classic candle detectors', () => {
  it('detects long legged doji', () => {
    const signals = new LongLeggedDojiDetector().detect(new ScanContext(withLastCandle(
      flatCandles(59),
      { time: 60, open: 100, high: 110, low: 90, close: 100.2, volume: 1000 },
    )));

    expect(signals[0]).toMatchObject({ id: PatternIdEnum.LongLeggedDoji, direction: PatternDirectionEnum.Neutral });
  });

  it('detects dragonfly doji', () => {
    const signals = new DragonflyDojiDetector().detect(new ScanContext(withLastCandle(
      flatCandles(59),
      { time: 60, open: 100, high: 100.2, low: 90, close: 100.1, volume: 1000 },
    )));

    expect(signals[0]).toMatchObject({ id: PatternIdEnum.DragonflyDoji, direction: PatternDirectionEnum.Bullish });
  });

  it('detects gravestone doji', () => {
    const signals = new GravestoneDojiDetector().detect(new ScanContext(withLastCandle(
      flatCandles(59),
      { time: 60, open: 100, high: 110, low: 99.9, close: 100.1, volume: 1000 },
    )));

    expect(signals[0]).toMatchObject({ id: PatternIdEnum.GravestoneDoji, direction: PatternDirectionEnum.Bearish });
  });

  it('detects spinning top', () => {
    const signals = new SpinningTopDetector().detect(new ScanContext(withLastCandle(
      flatCandles(59),
      { time: 60, open: 100, high: 110, low: 92, close: 102, volume: 1000 },
    )));

    expect(signals[0]).toMatchObject({ id: PatternIdEnum.SpinningTop, direction: PatternDirectionEnum.Neutral });
  });

  it('detects marubozu candles', () => {
    const bullishSignals = new BullishMarubozuDetector().detect(new ScanContext(withLastCandle(
      flatCandles(59),
      { time: 60, open: 100, high: 110, low: 99.8, close: 109.9, volume: 1000 },
    )));
    const bearishSignals = new RedMarubozuDetector().detect(new ScanContext(withLastCandle(
      flatCandles(59),
      { time: 60, open: 110, high: 110.2, low: 99.8, close: 100, volume: 1000 },
    )));

    expect(bullishSignals[0]).toMatchObject({ id: PatternIdEnum.BullishMarubozu, direction: PatternDirectionEnum.Bullish });
    expect(bearishSignals[0]).toMatchObject({ id: PatternIdEnum.BearishMarubozu, direction: PatternDirectionEnum.Bearish });
  });

  it('detects kicker candles', () => {
    const bullishSignals = new BullishKickerDetector().detect(new ScanContext([
      ...bearishTrendCandles(58),
      { time: 59, open: 145, high: 146, low: 135, close: 136, volume: 1000 },
      { time: 60, open: 147, high: 158, low: 146, close: 157, volume: 1000 },
    ]));
    const bearishSignals = new BearishKickerDetector().detect(new ScanContext([
      ...bullishTrendCandles(58),
      { time: 59, open: 155, high: 166, low: 154, close: 165, volume: 1000 },
      { time: 60, open: 153, high: 154, low: 140, close: 141, volume: 1000 },
    ]));

    expect(bullishSignals[0]).toMatchObject({ id: PatternIdEnum.BullishKicker, direction: PatternDirectionEnum.Bullish });
    expect(bearishSignals[0]).toMatchObject({ id: PatternIdEnum.BearishKicker, direction: PatternDirectionEnum.Bearish });
  });

  it('detects three candle sequences', () => {
    const bullishSignals = new ThreeWhiteSoldiersDetector().detect(new ScanContext([
      ...bearishTrendCandles(57),
      { time: 58, open: 135, high: 141, low: 134, close: 140, volume: 1000 },
      { time: 59, open: 140, high: 146, low: 139, close: 145, volume: 1000 },
      { time: 60, open: 145, high: 151, low: 144, close: 150, volume: 1000 },
    ]));
    const bearishSignals = new ThreeBlackCrowsDetector().detect(new ScanContext([
      ...bullishTrendCandles(57),
      { time: 58, open: 165, high: 166, low: 159, close: 160, volume: 1000 },
      { time: 59, open: 160, high: 161, low: 154, close: 155, volume: 1000 },
      { time: 60, open: 155, high: 156, low: 149, close: 150, volume: 1000 },
    ]));

    expect(bullishSignals[0]).toMatchObject({ id: PatternIdEnum.ThreeWhiteSoldiers, direction: PatternDirectionEnum.Bullish });
    expect(bearishSignals[0]).toMatchObject({ id: PatternIdEnum.ThreeBlackCrows, direction: PatternDirectionEnum.Bearish });
  });
});
