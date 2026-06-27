import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { HaramiDetector } from './HaramiDetector';

export class BullishHaramiDetector extends HaramiDetector {
  override readonly id = PatternIdEnum.BullishHarami;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.bullishHarami;
  protected override readonly requiredTrend = StructureTrendEnum.Bearish;
  protected override readonly previousBullish = false;
}
