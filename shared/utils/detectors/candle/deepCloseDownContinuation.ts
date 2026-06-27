import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { NeckCloseMode, NeckContinuationDetector } from './NeckContinuationDetector';

export class DeepCloseDownContinuationDetector extends NeckContinuationDetector {
  override readonly id = PatternIdEnum.Thrusting;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.thrusting;
  protected override readonly closeMode = NeckCloseMode.IntoPreviousBody;
}
