import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { HeadAndShouldersPatternDetector } from './HeadAndShouldersPatternDetector';

export class HeadAndShouldersDetector extends HeadAndShouldersPatternDetector {
  protected override readonly id = PatternIdEnum.HeadAndShoulders;
  protected override readonly direction = PatternDirectionEnum.Bearish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.headAndShoulders;
}
