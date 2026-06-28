import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { TasukiGapDetector } from './TasukiGapDetector';

export class UpsideTasukiGapDetector extends TasukiGapDetector {
  override readonly id = PatternIdEnum.UpsideTasukiGap;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.upsideTasukiGap;
  protected override readonly bullishContinuation = true;
  protected override readonly requiredTrend = StructureTrendEnum.Bullish;
}
