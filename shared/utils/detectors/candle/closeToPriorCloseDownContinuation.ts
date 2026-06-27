import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { NeckCloseMode, NeckContinuationDetector } from './NeckContinuationDetector';

export class CloseToPriorCloseDownContinuationDetector extends NeckContinuationDetector {
  override readonly id = PatternIdEnum.OnNeck;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.onNeck;
  protected override readonly closeMode = NeckCloseMode.NearPreviousClose;
}
