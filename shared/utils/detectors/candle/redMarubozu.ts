import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { MarubozuDetector } from './MarubozuDetector';

export class RedMarubozuDetector extends MarubozuDetector {
  override readonly id = PatternIdEnum.BearishMarubozu;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.bearishMarubozu;
  protected override readonly bullishBody = false;
}
