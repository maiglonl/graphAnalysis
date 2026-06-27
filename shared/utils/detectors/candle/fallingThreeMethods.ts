import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { ThreeMethodsDetector } from './ThreeMethodsDetector';

export class FallingThreeMethodsDetector extends ThreeMethodsDetector {
  override readonly id = PatternIdEnum.FallingThreeMethods;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.fallingThreeMethods;
  protected override readonly bullishContinuation = false;
  protected override readonly requiredTrend = StructureTrendEnum.Bearish;
}
