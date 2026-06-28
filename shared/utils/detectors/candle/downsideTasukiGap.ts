import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { TasukiGapDetector } from './TasukiGapDetector';

export class DownsideTasukiGapDetector extends TasukiGapDetector {
  override readonly id = PatternIdEnum.DownsideTasukiGap;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.downsideTasukiGap;
  protected override readonly bullishContinuation = false;
  protected override readonly requiredTrend = StructureTrendEnum.Bearish;
}
