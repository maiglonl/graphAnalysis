import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { SeparatingLinesDetector } from './SeparatingLinesDetector';

export class BullishSeparatingLinesDetector extends SeparatingLinesDetector {
  override readonly id = PatternIdEnum.BullishSeparatingLines;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.bullishSeparatingLines;
  protected override readonly bullishContinuation = true;
  protected override readonly requiredTrend = StructureTrendEnum.Bullish;
}
