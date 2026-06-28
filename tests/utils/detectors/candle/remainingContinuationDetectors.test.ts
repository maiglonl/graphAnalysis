import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { DownsideTasukiGapDetector } from '#shared/utils/detectors/candle/downsideTasukiGap';
import { InNeckDetector } from '#shared/utils/detectors/candle/inNeck';
import { IslandReversalBottomDetector } from '#shared/utils/detectors/candle/islandReversalBottom';
import { IslandReversalTopDetector } from '#shared/utils/detectors/candle/islandReversalTop';
import { MatHoldDetector } from '#shared/utils/detectors/candle/matHold';
import { OnNeckDetector } from '#shared/utils/detectors/candle/onNeck';
import { ThrustingDetector } from '#shared/utils/detectors/candle/thrusting';
import { UpsideTasukiGapDetector } from '#shared/utils/detectors/candle/upsideTasukiGap';
import { ScanContext } from '#shared/utils/scanContext';
import { bearishTrendCandles, bullishTrendCandles, flatCandles } from '../../../fixtures/candles/factories';

describe('remaining continuation candle detectors', () => {
  it('detects mat hold', () => {
    const candles = [
      ...bullishTrendCandles(55),
      { time: 56, open: 155, high: 162, low: 154, close: 161, volume: 1000 },
      { time: 57, open: 164, high: 166, low: 163, close: 165, volume: 900 },
      { time: 58, open: 165, high: 166, low: 162, close: 163, volume: 900 },
      { time: 59, open: 163, high: 165, low: 161, close: 162, volume: 900 },
      { time: 60, open: 162, high: 170, low: 161, close: 169, volume: 1200 },
    ];

    const signals = new MatHoldDetector().detect(new ScanContext(candles));

    expect(signals[0]).toMatchObject({ id: PatternIdEnum.MatHold, direction: PatternDirectionEnum.Bullish });
  });

  it('detects tasuki gaps', () => {
    const upsideSignals = new UpsideTasukiGapDetector().detect(new ScanContext([
      ...bullishTrendCandles(57),
      { time: 58, open: 155, high: 161, low: 154, close: 160, volume: 1000 },
      { time: 59, open: 165, high: 171, low: 164, close: 170, volume: 1000 },
      { time: 60, open: 169, high: 170, low: 161, close: 162, volume: 1000 },
    ]));
    const downsideSignals = new DownsideTasukiGapDetector().detect(new ScanContext([
      ...bearishTrendCandles(57),
      { time: 58, open: 160, high: 161, low: 154, close: 155, volume: 1000 },
      { time: 59, open: 149, high: 150, low: 143, close: 144, volume: 1000 },
      { time: 60, open: 145, high: 153, low: 144, close: 153, volume: 1000 },
    ]));

    expect(upsideSignals[0]).toMatchObject({ id: PatternIdEnum.UpsideTasukiGap, direction: PatternDirectionEnum.Bullish });
    expect(downsideSignals[0]).toMatchObject({ id: PatternIdEnum.DownsideTasukiGap, direction: PatternDirectionEnum.Bearish });
  });

  it('detects neck and thrusting continuations', () => {
    const onNeckSignals = new OnNeckDetector().detect(new ScanContext([
      ...bearishTrendCandles(58),
      { time: 59, open: 160, high: 161, low: 149, close: 150, volume: 1000 },
      { time: 60, open: 148, high: 151, low: 147, close: 150.1, volume: 1000 },
    ]));
    const inNeckSignals = new InNeckDetector().detect(new ScanContext([
      ...bearishTrendCandles(58),
      { time: 59, open: 160, high: 161, low: 149, close: 150, volume: 1000 },
      { time: 60, open: 148, high: 152, low: 147, close: 151, volume: 1000 },
    ]));
    const thrustingSignals = new ThrustingDetector().detect(new ScanContext([
      ...bearishTrendCandles(58),
      { time: 59, open: 160, high: 161, low: 149, close: 150, volume: 1000 },
      { time: 60, open: 148, high: 157, low: 147, close: 156, volume: 1000 },
    ]));

    expect(onNeckSignals[0]).toMatchObject({ id: PatternIdEnum.OnNeck, direction: PatternDirectionEnum.Bearish });
    expect(inNeckSignals[0]).toMatchObject({ id: PatternIdEnum.InNeck, direction: PatternDirectionEnum.Bearish });
    expect(thrustingSignals[0]).toMatchObject({ id: PatternIdEnum.Thrusting, direction: PatternDirectionEnum.Bearish });
  });

  it('detects island reversals', () => {
    const bottomSignals = new IslandReversalBottomDetector().detect(new ScanContext([
      ...flatCandles(57),
      { time: 58, open: 103, high: 106, low: 100, close: 104, volume: 1000 },
      { time: 59, open: 91, high: 94, low: 90, close: 92, volume: 1000 },
      { time: 60, open: 98, high: 105, low: 97, close: 104, volume: 1000 },
    ]));
    const topSignals = new IslandReversalTopDetector().detect(new ScanContext([
      ...flatCandles(57),
      { time: 58, open: 97, high: 100, low: 94, close: 96, volume: 1000 },
      { time: 59, open: 109, high: 112, low: 108, close: 110, volume: 1000 },
      { time: 60, open: 101, high: 102, low: 95, close: 96, volume: 1000 },
    ]));

    expect(bottomSignals[0]).toMatchObject({ id: PatternIdEnum.IslandReversalBottom, direction: PatternDirectionEnum.Bullish });
    expect(topSignals[0]).toMatchObject({ id: PatternIdEnum.IslandReversalTop, direction: PatternDirectionEnum.Bearish });
  });
});
