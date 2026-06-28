import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { TrendPatternDetector } from './TrendPatternDetector';

export class MaPullbackBullishDetector extends TrendPatternDetector {
  protected override readonly id = PatternIdEnum.MaPullbackBullish;
  protected override readonly direction = PatternDirectionEnum.Bullish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.maPullbackBullish;

  protected override matches(ctx: ScanContext): boolean {
    const current = ctx.currentCandle;
    if (!current || ctx.trend() !== StructureTrendEnum.Bullish) return false;
    const ema20 = ctx.ema20[ctx.index] ?? 0;
    if (ema20 <= 0) return false;
    const touchedEma = Math.abs(current.low - ema20) / ema20 <= EXTRA_THRESHOLDS.maPullbackTolerancePct;
    return touchedEma && current.close > current.open && current.close > ema20;
  }
}
