import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { RangePatternDetector } from './RangePatternDetector';

export class RangeRejectionLowDetector extends RangePatternDetector {
  protected override readonly id = PatternIdEnum.RangeRejectionLow;
  protected override readonly direction = PatternDirectionEnum.Bullish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.rangeRejectionLow;
  protected override readonly signalType = 'rejection' as const;
}
