import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { SeparatingLinesDetector } from './SeparatingLinesDetector';

export class BearishSeparatingLinesDetector extends SeparatingLinesDetector {
  override readonly id = PatternIdEnum.BearishSeparatingLines;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.bearishSeparatingLines;
  protected override readonly bullishContinuation = false;
  protected override readonly requiredTrend = StructureTrendEnum.Bearish;
}
