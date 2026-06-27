import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { GapFillDetector } from './GapFillDetector';

export class GapFillBearishDetector extends GapFillDetector {
  override readonly id = PatternIdEnum.GapFillBearish;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.gapFillBearish;
  protected override readonly bullishFill = false;
}
