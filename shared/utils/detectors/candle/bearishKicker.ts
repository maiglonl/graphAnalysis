import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { KickerDetector } from './KickerDetector';

export class BearishKickerDetector extends KickerDetector {
  override readonly id = PatternIdEnum.BearishKicker;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.bearishKicker;
  protected override readonly bullishBody = false;
  protected override readonly requiredTrend = StructureTrendEnum.Bullish;
}
