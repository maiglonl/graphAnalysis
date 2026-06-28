import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { getSwingLows } from '#shared/utils/marketStructure';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { TrendPatternDetector } from './TrendPatternDetector';

export class RetestSupportDetector extends TrendPatternDetector {
  protected override readonly id = PatternIdEnum.RetestSupport;
  protected override readonly direction = PatternDirectionEnum.Bullish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.retestSupport;

  protected override matches(ctx: ScanContext): boolean {
    const current = ctx.currentCandle;
    if (!current || ctx.index < 4) return false;
    const swingLows = getSwingLows(ctx.candles, ctx.index, 1);
    if (swingLows.length === 0) return false;
    const support = swingLows[0]!.price;
    const tolerance = support * EXTRA_THRESHOLDS.retestTolerancePct;
    return current.low <= support + tolerance && current.close > current.open;
  }
}
