import { describe, expect, it } from 'vitest';
import { PatternIdEnum } from '#shared/types/market';
import { HammerDetector } from '#shared/utils/detectors/candle/hammer';
import { ScanContext } from '#shared/utils/scanContext';
import { bearishTrendCandles, withLastCandle } from '../../../../fixtures/candles/factories';

describe('HammerDetector', () => {
  it('detects hammer after a bearish trend', () => {
    const candles = withLastCandle(
      bearishTrendCandles(59),
      { time: 60, open: 138, high: 140.4, low: 130, close: 140, volume: 1500 },
    );

    const signals = new HammerDetector().detect(new ScanContext(candles));

    expect(signals).toHaveLength(1);
    expect(signals[0]?.id).toBe(PatternIdEnum.Hammer);
  });
});
