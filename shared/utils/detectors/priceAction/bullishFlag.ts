import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { ContinuationBreakoutPatternDetector, ContinuationBreakoutShapeEnum } from './ContinuationBreakoutPatternDetector';

export class BullishFlagDetector extends ContinuationBreakoutPatternDetector {
  protected override readonly id = PatternIdEnum.BullishFlag;
  protected override readonly direction = PatternDirectionEnum.Bullish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.bullishFlag;
  protected override readonly shape = ContinuationBreakoutShapeEnum.Flag;
}
