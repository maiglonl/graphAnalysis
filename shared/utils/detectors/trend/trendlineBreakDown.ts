import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { TrendPatternDetector } from './TrendPatternDetector';

export class TrendlineBreakDownDetector extends TrendPatternDetector {
  protected override readonly id = PatternIdEnum.TrendlineBreakDown;
  protected override readonly direction = PatternDirectionEnum.Bearish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.trendlineBreakDown;

  protected override matches(ctx: ScanContext): boolean {
    const current = ctx.currentCandle;
    const lookback = EXTRA_THRESHOLDS.trendlineBreakLookback;
    if (!current || ctx.index < lookback) return false;
    const lookbackCandles = ctx.candles.slice(ctx.index - lookback, ctx.index);
    const supportLow = Math.min(...lookbackCandles.map((c) => c.low));
    return current.close < supportLow;
  }
}
