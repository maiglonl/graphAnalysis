import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { RANGE_PATTERN_CONFIDENCE } from './rangePatternConstants';
import { RangePatternDetector } from './RangePatternDetector';

export class RangeRejectionHighDetector extends RangePatternDetector {
  protected override readonly id = PatternIdEnum.RangeRejectionHigh;
  protected override readonly direction = PatternDirectionEnum.Bearish;
  protected override readonly baseConfidence = RANGE_PATTERN_CONFIDENCE.rangeRejectionHigh;
  protected override readonly signalType = 'rejection' as const;
}
