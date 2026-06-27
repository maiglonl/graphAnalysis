import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { GapDetector } from './GapDetector';

export class RunawayGapUpDetector extends GapDetector {
  override readonly id = PatternIdEnum.RunawayGapUp;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.runawayGapUp;
  protected override readonly bullishGap = true;
  protected override readonly requiredTrend = StructureTrendEnum.Bullish;
}
