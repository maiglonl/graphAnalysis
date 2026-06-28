import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { SwingReversalPatternDetector } from './SwingReversalPatternDetector';

export class DoubleTopDetector extends SwingReversalPatternDetector {
  protected override readonly id = PatternIdEnum.DoubleTop;
  protected override readonly direction = PatternDirectionEnum.Bearish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.doubleTop;
  protected override readonly swingCount = 2;
}
