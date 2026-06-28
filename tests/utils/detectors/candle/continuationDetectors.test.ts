import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { BearishSeparatingLinesDetector } from '#shared/utils/detectors/candle/bearishSeparatingLines';
import { BullishSeparatingLinesDetector } from '#shared/utils/detectors/candle/bullishSeparatingLines';
import { FallingThreeMethodsDetector } from '#shared/utils/detectors/candle/fallingThreeMethods';
import { InNeckDetector } from '#shared/utils/detectors/candle/inNeck';
import { OnNeckDetector } from '#shared/utils/detectors/candle/onNeck';
import { RisingThreeMethodsDetector } from '#shared/utils/detectors/candle/risingThreeMethods';
import { ThrustingDetector } from '#shared/utils/detectors/candle/thrusting';
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

  // bearishTrendCandles(58): last close ≈ 142, price in ~130-150 zone
  // We add a large bearish candle: open=150, close=135, body=15
  // prevBodyLow = 135, prevBodySize = 15, tolerance = 15*0.05 = 0.75
  it('detects on neck — close at prior body low within tolerance', () => {
    const candles = [
      ...bearishTrendCandles(58),
      { time: 59, open: 150, high: 152, low: 132, close: 135, volume: 1500 },
      // close = 135.5 ≈ prevBodyLow=135 (diff=0.5, within tolerance 0.75)
      { time: 60, open: 131, high: 136, low: 130, close: 135.5, volume: 1000 },
    ];
    const signals = new OnNeckDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({ id: PatternIdEnum.OnNeck, direction: PatternDirectionEnum.Bearish });
  });

  it('does not detect on neck when close is above the tolerance band', () => {
    const candles = [
      ...bearishTrendCandles(58),
      { time: 59, open: 150, high: 152, low: 132, close: 135, volume: 1500 },
      // close = 138 is above 135 + 0.75 tolerance → should not detect On Neck
      { time: 60, open: 131, high: 139, low: 130, close: 138, volume: 1000 },
    ];
    expect(new OnNeckDetector().detect(new ScanContext(candles))).toHaveLength(0);
  });

  it('detects in neck — close slightly penetrates prior body', () => {
    const candles = [
      ...bearishTrendCandles(58),
      { time: 59, open: 150, high: 152, low: 132, close: 135, volume: 1500 },
      // close = 137 → 135 + 2 = 13.3% into body, below 25% threshold (135 + 3.75 = 138.75)
      { time: 60, open: 131, high: 138, low: 130, close: 137, volume: 1000 },
    ];
    const signals = new InNeckDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({ id: PatternIdEnum.InNeck, direction: PatternDirectionEnum.Bearish });
  });

  it('does not detect in neck when close is at body low (on-neck zone)', () => {
    const candles = [
      ...bearishTrendCandles(58),
      { time: 59, open: 150, high: 152, low: 132, close: 135, volume: 1500 },
      // close = 135.5 is within on-neck tolerance — not in-neck
      { time: 60, open: 131, high: 136, low: 130, close: 135.5, volume: 1000 },
    ];
    expect(new InNeckDetector().detect(new ScanContext(candles))).toHaveLength(0);
  });

  it('detects thrusting — close in lower half of prior body, above in-neck threshold', () => {
    const candles = [
      ...bearishTrendCandles(58),
      { time: 59, open: 150, high: 152, low: 132, close: 135, volume: 1500 },
      // close = 141 → 135 + 6 = 40% into body (above 25% inNeck threshold, below 50% midpoint)
      { time: 60, open: 131, high: 142, low: 130, close: 141, volume: 1000 },
    ];
    const signals = new ThrustingDetector().detect(new ScanContext(candles));
    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({ id: PatternIdEnum.Thrusting, direction: PatternDirectionEnum.Bearish });
  });

  it('does not detect thrusting when close reaches or exceeds midpoint', () => {
    const candles = [
      ...bearishTrendCandles(58),
      { time: 59, open: 150, high: 152, low: 132, close: 135, volume: 1500 },
      // close = 142.5 = midpoint exactly → NOT thrusting (midpoint = piercing line territory)
      { time: 60, open: 131, high: 144, low: 130, close: 142.5, volume: 1000 },
    ];
    expect(new ThrustingDetector().detect(new ScanContext(candles))).toHaveLength(0);
  });
});
