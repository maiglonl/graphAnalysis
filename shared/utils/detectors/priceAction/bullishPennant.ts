import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { ContinuationBreakoutPatternDetector, ContinuationBreakoutShapeEnum } from './ContinuationBreakoutPatternDetector';

export class BullishPennantDetector extends ContinuationBreakoutPatternDetector {
  protected override readonly id = PatternIdEnum.BullishPennant;
  protected override readonly direction = PatternDirectionEnum.Bullish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.bullishPennant;
  protected override readonly shape = ContinuationBreakoutShapeEnum.Pennant;
}
