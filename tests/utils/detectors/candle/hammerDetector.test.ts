import { describe, expect, it } from 'vitest';
import { PatternIdEnum } from '#shared/types/market';
import { HammerDetector } from '#shared/utils/detectors/candle/hammer';
import { ScanContext } from '#shared/utils/scanContext';
import { hammerCandles } from '../../../fixtures/candles/hammer';

describe('HammerDetector', () => {
  it('detects hammer after a bearish trend', () => {
    const signals = new HammerDetector().detect(new ScanContext(hammerCandles()));

    expect(signals).toHaveLength(1);
    expect(signals[0]?.id).toBe(PatternIdEnum.Hammer);
  });
});
