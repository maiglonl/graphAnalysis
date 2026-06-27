import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { ThreeCandleSequenceDetector } from './ThreeCandleSequenceDetector';

export class ThreeWhiteSoldiersDetector extends ThreeCandleSequenceDetector {
  override readonly id = PatternIdEnum.ThreeWhiteSoldiers;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.threeWhiteSoldiers;
  protected override readonly bullishSequence = true;
  protected override readonly requiredTrend = StructureTrendEnum.Bearish;
}
