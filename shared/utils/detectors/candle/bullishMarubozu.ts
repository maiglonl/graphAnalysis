import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { MarubozuDetector } from './MarubozuDetector';

export class BullishMarubozuDetector extends MarubozuDetector {
  override readonly id = PatternIdEnum.BullishMarubozu;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.bullishMarubozu;
  protected override readonly bullishBody = true;
}
