import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { ExhaustionGapDetector } from './ExhaustionGapDetector';

export class ExhaustionGapUpDetector extends ExhaustionGapDetector {
  override readonly id = PatternIdEnum.ExhaustionGapUp;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.exhaustionGapUp;
  protected override readonly bullishGap = true;
  protected override readonly requiredTrend = StructureTrendEnum.Bullish;
}
