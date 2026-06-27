import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { GapFillDetector } from './GapFillDetector';

export class GapFillBullishDetector extends GapFillDetector {
  override readonly id = PatternIdEnum.GapFillBullish;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.gapFillBullish;
  protected override readonly bullishFill = true;
}
