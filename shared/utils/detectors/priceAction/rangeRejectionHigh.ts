import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { RangePatternDetector } from './RangePatternDetector';

export class RangeRejectionHighDetector extends RangePatternDetector {
  protected override readonly id = PatternIdEnum.RangeRejectionHigh;
  protected override readonly direction = PatternDirectionEnum.Bearish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.rangeRejectionHigh;
  protected override readonly signalType = 'rejection' as const;
}
