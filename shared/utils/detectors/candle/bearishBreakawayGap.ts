import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { GapDetector } from './GapDetector';

export class BearishBreakawayGapDetector extends GapDetector {
  override readonly id = PatternIdEnum.BearishBreakawayGap;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.bearishBreakawayGap;
  protected override readonly bullishGap = false;
  protected override readonly requiredTrend = StructureTrendEnum.Bullish;
}
