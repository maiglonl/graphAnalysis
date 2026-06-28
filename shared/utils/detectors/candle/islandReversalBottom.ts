import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { IslandReversalDetector } from './IslandReversalDetector';

export class IslandReversalBottomDetector extends IslandReversalDetector {
  override readonly id = PatternIdEnum.IslandReversalBottom;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.islandReversalBottom;
  protected override readonly bullishReversal = true;
}
