import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { TrendPatternDetector } from './TrendPatternDetector';

export class MaPullbackBearishDetector extends TrendPatternDetector {
  protected override readonly id = PatternIdEnum.MaPullbackBearish;
  protected override readonly direction = PatternDirectionEnum.Bearish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.maPullbackBearish;

  protected override matches(ctx: ScanContext): boolean {
    const current = ctx.currentCandle;
    if (!current || ctx.trend() !== StructureTrendEnum.Bearish) return false;
    const ema20 = ctx.ema20[ctx.index] ?? 0;
    if (ema20 <= 0) return false;
    const touchedEma = Math.abs(current.high - ema20) / ema20 <= EXTRA_THRESHOLDS.maPullbackTolerancePct;
    return touchedEma && current.close < current.open && current.close < ema20;
  }
}
