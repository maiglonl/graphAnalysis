import type { PatternSignal, SwingPoint } from '#shared/types/market';
import { PatternDirectionEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { getSwingHighs, getSwingLows } from '#shared/utils/marketStructure';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';

export abstract class SwingReversalPatternDetector extends PatternDetector {
  protected abstract readonly id: PatternSignal['id'];
  protected abstract readonly direction: PatternDirectionEnum;
  protected abstract readonly baseConfidence: number;
  protected abstract readonly swingCount: number;

  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current) return [];

    const swings = this.direction === PatternDirectionEnum.Bearish
      ? getSwingHighs(ctx.candles, ctx.index, this.swingCount)
      : getSwingLows(ctx.candles, ctx.index, this.swingCount);
    const oppositeSwings = this.direction === PatternDirectionEnum.Bearish
      ? getSwingLows(ctx.candles, ctx.index, this.swingCount)
      : getSwingHighs(ctx.candles, ctx.index, this.swingCount);

    if (swings.length < this.swingCount || oppositeSwings.length === 0) return [];
    if (!this.areSimilar(swings)) return [];

    const level = this.averageSwingPrice(swings);
    const breakLevel = oppositeSwings[0]!.price;
    const breakThreshold = breakLevel * EXTRA_THRESHOLDS.swingPatternMinBreakPct;
    const hasBreak = this.direction === PatternDirectionEnum.Bearish
      ? current.close < breakLevel - breakThreshold
      : current.close > breakLevel + breakThreshold;

    if (!hasBreak) return [];

    const risk = Math.abs(level - breakLevel);
    if (risk <= 0) return [];

    const entry = current.close;
    const stop = level;
    const targets = calculateTargets(entry, risk, this.direction === PatternDirectionEnum.Bearish ? 'down' : 'up');

    return [{
      id: this.id,
      direction: this.direction,
      confidence: this.baseConfidence,
      price: current.close,
      entry,
      stop,
      targets,
      meta: { level, breakLevel },
    }];
  }

  private areSimilar(swings: SwingPoint[]): boolean {
    const prices = swings.map((swing) => swing.price);
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    const average = this.averageSwingPrice(swings);
    if (average <= 0) return false;
    return (max - min) / average <= EXTRA_THRESHOLDS.swingPatternTolerancePct;
  }

  private averageSwingPrice(swings: SwingPoint[]): number {
    return swings.reduce((sum, swing) => sum + swing.price, 0) / swings.length;
  }
}
