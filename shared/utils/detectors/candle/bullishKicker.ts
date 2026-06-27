import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { KickerDetector } from './KickerDetector';

export class BullishKickerDetector extends KickerDetector {
  override readonly id = PatternIdEnum.BullishKicker;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.bullishKicker;
  protected override readonly bullishBody = true;
  protected override readonly requiredTrend = StructureTrendEnum.Bearish;
}
