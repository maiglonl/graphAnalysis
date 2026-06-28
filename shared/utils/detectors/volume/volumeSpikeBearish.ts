import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { VolumePatternDetector } from './VolumePatternDetector';

export class VolumeSpikeBearishDetector extends VolumePatternDetector {
  protected override readonly id = PatternIdEnum.VolumeSpikeBearish;
  protected override readonly direction = PatternDirectionEnum.Bearish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.volumeSpikeBearish;

  protected override matches(ctx: ScanContext): boolean {
    const current = ctx.currentCandle;
    return Boolean(
      current &&
      current.close < current.open &&
      ctx.currentRelativeVolume >= EXTRA_THRESHOLDS.volumeSpikeRelativeMin,
    );
  }
}
