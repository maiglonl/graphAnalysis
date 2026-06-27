import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { GapDetector } from './GapDetector';

export class RunawayGapDownDetector extends GapDetector {
  override readonly id = PatternIdEnum.RunawayGapDown;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.runawayGapDown;
  protected override readonly bullishGap = false;
  protected override readonly requiredTrend = StructureTrendEnum.Bearish;
}
