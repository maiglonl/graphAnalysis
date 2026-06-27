import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { NeckCloseMode, NeckContinuationDetector } from './NeckContinuationDetector';

export class SlightCloseDownContinuationDetector extends NeckContinuationDetector {
  override readonly id = PatternIdEnum.InNeck;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.inNeck;
  protected override readonly closeMode = NeckCloseMode.SlightlyAbovePreviousClose;
}
