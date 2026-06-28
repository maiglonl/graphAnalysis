import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { HeadAndShouldersPatternDetector } from './HeadAndShouldersPatternDetector';

export class InverseHeadAndShouldersDetector extends HeadAndShouldersPatternDetector {
  protected override readonly id = PatternIdEnum.InverseHeadAndShoulders;
  protected override readonly direction = PatternDirectionEnum.Bullish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.inverseHeadAndShoulders;
}
