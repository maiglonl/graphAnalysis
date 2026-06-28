import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import type { Candle } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import type { MatchResult } from '../CandlePatternDetector';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { calculateTargets, candleParts } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';

export class DarkCloudCoverDetector extends CandlePatternDetector {
  readonly id = PatternIdEnum.DarkCloudCover;
  readonly direction = PatternDirectionEnum.Bearish;
  readonly baseConfidence = EXTRA_CONFIDENCE.darkCloudCover;

  protected override match(candles: Candle[], index: number, ctx: ScanContext): MatchResult | null {
    // TODO: Implement in Task 4
    return null;
  }
}
