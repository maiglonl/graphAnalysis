import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { GapDetector } from './GapDetector';

export class BullishBreakawayGapDetector extends GapDetector {
  override readonly id = PatternIdEnum.BullishBreakawayGap;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.bullishBreakawayGap;
  protected override readonly bullishGap = true;
  protected override readonly requiredTrend = StructureTrendEnum.Bearish;
}
