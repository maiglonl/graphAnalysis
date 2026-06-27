import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { HaramiDetector } from './HaramiDetector';

export class BearishHaramiDetector extends HaramiDetector {
  override readonly id = PatternIdEnum.BearishHarami;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.bearishHarami;
  protected override readonly requiredTrend = StructureTrendEnum.Bullish;
  protected override readonly previousBullish = true;
}
