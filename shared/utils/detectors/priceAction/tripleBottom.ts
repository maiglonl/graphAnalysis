import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { SwingReversalPatternDetector } from './SwingReversalPatternDetector';

export class TripleBottomDetector extends SwingReversalPatternDetector {
  protected override readonly id = PatternIdEnum.TripleBottom;
  protected override readonly direction = PatternDirectionEnum.Bullish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.tripleBottom;
  protected override readonly swingCount = 3;
}
