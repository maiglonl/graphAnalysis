import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { SwingReversalPatternDetector } from './SwingReversalPatternDetector';

export class DoubleBottomDetector extends SwingReversalPatternDetector {
  protected override readonly id = PatternIdEnum.DoubleBottom;
  protected override readonly direction = PatternDirectionEnum.Bullish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.doubleBottom;
  protected override readonly swingCount = 2;
}
