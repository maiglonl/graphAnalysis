import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { VolumePatternDetector } from './VolumePatternDetector';

export class ClimaxVolumeBottomDetector extends VolumePatternDetector {
  protected override readonly id = PatternIdEnum.ClimaxVolumeBottom;
  protected override readonly direction = PatternDirectionEnum.Bullish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.climaxVolumeBottom;

  protected override matches(ctx: ScanContext): boolean {
    const current = ctx.currentCandle;
    return Boolean(
      current &&
      ctx.trend() === StructureTrendEnum.Bearish &&
      current.close > current.open &&
      ctx.currentRelativeVolume >= EXTRA_THRESHOLDS.climaxRelativeVolumeMin,
    );
  }
}
