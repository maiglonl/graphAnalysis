import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { TrendPatternDetector } from './TrendPatternDetector';

export class TrendlineBreakUpDetector extends TrendPatternDetector {
  protected override readonly id = PatternIdEnum.TrendlineBreakUp;
  protected override readonly direction = PatternDirectionEnum.Bullish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.trendlineBreakUp;

  protected override matches(ctx: ScanContext): boolean {
    const current = ctx.currentCandle;
    const lookback = EXTRA_THRESHOLDS.trendlineBreakLookback;
    if (!current || ctx.index < lookback) return false;
    const lookbackCandles = ctx.candles.slice(ctx.index - lookback, ctx.index);
    const resistanceHigh = Math.max(...lookbackCandles.map((c) => c.high));
    return current.close > resistanceHigh;
  }
}
