import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { ExhaustionGapDetector } from './ExhaustionGapDetector';

export class ExhaustionGapDownDetector extends ExhaustionGapDetector {
  override readonly id = PatternIdEnum.ExhaustionGapDown;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.exhaustionGapDown;
  protected override readonly bullishGap = false;
  protected override readonly requiredTrend = StructureTrendEnum.Bearish;
}
