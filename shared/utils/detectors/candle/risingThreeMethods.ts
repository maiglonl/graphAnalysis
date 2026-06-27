import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { ThreeMethodsDetector } from './ThreeMethodsDetector';

export class RisingThreeMethodsDetector extends ThreeMethodsDetector {
  override readonly id = PatternIdEnum.RisingThreeMethods;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.risingThreeMethods;
  protected override readonly bullishContinuation = true;
  protected override readonly requiredTrend = StructureTrendEnum.Bullish;
}
