import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { TrendPatternDetector } from './TrendPatternDetector';

export class DeathCrossDetector extends TrendPatternDetector {
  protected override readonly id = PatternIdEnum.DeathCross;
  protected override readonly direction = PatternDirectionEnum.Bearish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.deathCross;

  protected override matches(ctx: ScanContext): boolean {
    if (ctx.index < 1) return false;
    const prevEma20 = ctx.ema20[ctx.index - 1] ?? 0;
    const prevEma50 = ctx.ema50[ctx.index - 1] ?? 0;
    const currEma20 = ctx.ema20[ctx.index] ?? 0;
    const currEma50 = ctx.ema50[ctx.index] ?? 0;
    return prevEma20 >= prevEma50 && currEma20 < currEma50;
  }
}
