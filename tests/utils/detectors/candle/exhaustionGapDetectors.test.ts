import { describe, expect, it } from 'vitest';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { ExhaustionGapDownDetector } from '#shared/utils/detectors/candle/exhaustionGapDown';
import { ExhaustionGapUpDetector } from '#shared/utils/detectors/candle/exhaustionGapUp';
import { ScanContext } from '#shared/utils/scanContext';
import { bearishTrendCandles, bullishTrendCandles } from '../../../fixtures/candles/factories';

describe('exhaustion gap detectors', () => {
  it('detects exhaustion gap up as a bearish reversal warning', () => {
    const signals = new ExhaustionGapUpDetector().detect(new ScanContext([
      ...bullishTrendCandles(59),
      { time: 60, open: 166, high: 167, low: 160, close: 161, volume: 1400 },
    ]));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.ExhaustionGapUp,
      direction: PatternDirectionEnum.Bearish,
    });
  });

  it('detects exhaustion gap down as a bullish reversal warning', () => {
    const signals = new ExhaustionGapDownDetector().detect(new ScanContext([
      ...bearishTrendCandles(59),
      { time: 60, open: 134, high: 140, low: 133, close: 139, volume: 1400 },
    ]));

    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.ExhaustionGapDown,
      direction: PatternDirectionEnum.Bullish,
    });
  });
});
