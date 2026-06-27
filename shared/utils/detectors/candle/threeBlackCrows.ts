import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { ThreeCandleSequenceDetector } from './ThreeCandleSequenceDetector';

export class ThreeBlackCrowsDetector extends ThreeCandleSequenceDetector {
  override readonly id = PatternIdEnum.ThreeBlackCrows;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.threeBlackCrows;
  protected override readonly bullishSequence = false;
  protected override readonly requiredTrend = StructureTrendEnum.Bullish;
}
