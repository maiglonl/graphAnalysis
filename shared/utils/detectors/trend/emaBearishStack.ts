import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { TrendPatternDetector } from './TrendPatternDetector';

export class EmaBearishStackDetector extends TrendPatternDetector {
  protected override readonly id = PatternIdEnum.EmaBearishStack;
  protected override readonly direction = PatternDirectionEnum.Bearish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.emaBearishStack;

  protected override matches(ctx: ScanContext): boolean {
    const current = ctx.currentCandle;
    if (!current) return false;
    const ema20 = ctx.ema20[ctx.index] ?? 0;
    const ema50 = ctx.ema50[ctx.index] ?? 0;
    return current.close < ema20 && ema20 < ema50;
  }
}
