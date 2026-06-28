import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { IslandReversalDetector } from './IslandReversalDetector';

export class IslandReversalTopDetector extends IslandReversalDetector {
  override readonly id = PatternIdEnum.IslandReversalTop;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.islandReversalTop;
  protected override readonly bullishReversal = false;
}
