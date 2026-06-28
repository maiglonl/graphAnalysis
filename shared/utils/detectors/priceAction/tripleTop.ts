import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { SwingReversalPatternDetector } from './SwingReversalPatternDetector';

export class TripleTopDetector extends SwingReversalPatternDetector {
  protected override readonly id = PatternIdEnum.TripleTop;
  protected override readonly direction = PatternDirectionEnum.Bearish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.tripleTop;
  protected override readonly swingCount = 3;
}
