import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { BearishBreakawayGapDetector } from '#shared/utils/detectors/candle/bearishBreakawayGap';
import { BullishBreakawayGapDetector } from '#shared/utils/detectors/candle/bullishBreakawayGap';
import { GapFillBearishDetector } from '#shared/utils/detectors/candle/gapFillBearish';
import { GapFillBullishDetector } from '#shared/utils/detectors/candle/gapFillBullish';
import { RunawayGapDownDetector } from '#shared/utils/detectors/candle/runawayGapDown';
import { RunawayGapUpDetector } from '#shared/utils/detectors/candle/runawayGapUp';
import { ScanContext } from '#shared/utils/scanContext';
import { bearishTrendCandles, bullishTrendCandles, flatCandles } from '../../../fixtures/candles/factories';

describe('gap detectors', () => {
  it('detects breakaway gaps', () => {
    const bullishSignals = new BullishBreakawayGapDetector().detect(new ScanContext([
      ...bearishTrendCandles(59),
      { time: 60, open: 144, high: 148, low: 144, close: 145, volume: 1000 },
    ]));
    const bearishSignals = new BearishBreakawayGapDetector().detect(new ScanContext([
      ...bullishTrendCandles(59),
      { time: 60, open: 156, high: 156.5, low: 150, close: 156, volume: 1000 },
    ]));

    expect(bullishSignals[0]).toMatchObject({ id: PatternIdEnum.BullishBreakawayGap, direction: PatternDirectionEnum.Bullish });
    expect(bearishSignals[0]).toMatchObject({ id: PatternIdEnum.BearishBreakawayGap, direction: PatternDirectionEnum.Bearish });
  });

  it('detects runaway gaps', () => {
    const bullishSignals = new RunawayGapUpDetector().detect(new ScanContext([
      ...bullishTrendCandles(59),
      { time: 60, open: 160, high: 166, low: 160, close: 165, volume: 1000 },
    ]));
    const bearishSignals = new RunawayGapDownDetector().detect(new ScanContext([
      ...bearishTrendCandles(59),
      { time: 60, open: 140, high: 140, low: 134, close: 135, volume: 1000 },
    ]));

    expect(bullishSignals[0]).toMatchObject({ id: PatternIdEnum.RunawayGapUp, direction: PatternDirectionEnum.Bullish });
    expect(bearishSignals[0]).toMatchObject({ id: PatternIdEnum.RunawayGapDown, direction: PatternDirectionEnum.Bearish });
  });

  it('detects gap fills', () => {
    const bullishSignals = new GapFillBullishDetector().detect(new ScanContext([
      ...flatCandles(57),
      { time: 58, open: 105, high: 106, low: 100, close: 104, volume: 1000 },
      { time: 59, open: 94, high: 95, low: 90, close: 91, volume: 1000 },
      { time: 60, open: 92, high: 101, low: 91, close: 100, volume: 1000 },
    ]));
    const bearishSignals = new GapFillBearishDetector().detect(new ScanContext([
      ...flatCandles(57),
      { time: 58, open: 95, high: 100, low: 94, close: 96, volume: 1000 },
      { time: 59, open: 106, high: 110, low: 105, close: 109, volume: 1000 },
      { time: 60, open: 108, high: 109, low: 99, close: 100, volume: 1000 },
    ]));

    expect(bullishSignals[0]).toMatchObject({ id: PatternIdEnum.GapFillBullish, direction: PatternDirectionEnum.Bullish });
    expect(bearishSignals[0]).toMatchObject({ id: PatternIdEnum.GapFillBearish, direction: PatternDirectionEnum.Bearish });
  });
});
