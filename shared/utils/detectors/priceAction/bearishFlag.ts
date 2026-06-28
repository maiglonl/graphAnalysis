import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { ContinuationBreakoutPatternDetector, ContinuationBreakoutShapeEnum } from './ContinuationBreakoutPatternDetector';

export class BearishFlagDetector extends ContinuationBreakoutPatternDetector {
  protected override readonly id = PatternIdEnum.BearishFlag;
  protected override readonly direction = PatternDirectionEnum.Bearish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.bearishFlag;
  protected override readonly shape = ContinuationBreakoutShapeEnum.Flag;
}
