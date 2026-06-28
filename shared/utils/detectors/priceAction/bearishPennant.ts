import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { ContinuationBreakoutPatternDetector, ContinuationBreakoutShapeEnum } from './ContinuationBreakoutPatternDetector';

export class BearishPennantDetector extends ContinuationBreakoutPatternDetector {
  protected override readonly id = PatternIdEnum.BearishPennant;
  protected override readonly direction = PatternDirectionEnum.Bearish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.bearishPennant;
  protected override readonly shape = ContinuationBreakoutShapeEnum.Pennant;
}
