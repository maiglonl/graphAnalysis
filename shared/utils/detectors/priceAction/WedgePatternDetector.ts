import type { PatternSignal } from '#shared/types/market';
import { PatternDirectionEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';

export abstract class WedgePatternDetector extends PatternDetector {
  protected abstract readonly id: PatternSignal['id'];
  protected abstract readonly direction: PatternDirectionEnum;
  protected abstract readonly baseConfidence: number;

  protected abstract matchesShape(
    firstAvgHigh: number,
    firstAvgLow: number,
    secondAvgHigh: number,
    secondAvgLow: number,
  ): boolean;

  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current) return [];

    const lookback = EXTRA_THRESHOLDS.wedgePatternLookback;
    if (ctx.index < lookback) return [];

    const candles = ctx.candles.slice(ctx.index - lookback, ctx.index);
    if (candles.length < lookback) return [];

    const mid = Math.floor(candles.length / 2);
    const first = candles.slice(0, mid);
    const second = candles.slice(mid);
    const avg = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const fH = avg(first.map((c) => c.high));
    const fL = avg(first.map((c) => c.low));
    const sH = avg(second.map((c) => c.high));
    const sL = avg(second.map((c) => c.low));

    if (!this.matchesShape(fH, fL, sH, sL)) return [];

    const rangeHigh = Math.max(...candles.map((c) => c.high));
    const rangeLow = Math.min(...candles.map((c) => c.low));
    const risk = rangeHigh - rangeLow;
    if (risk <= 0) return [];

    const breakThreshold = current.close * EXTRA_THRESHOLDS.swingPatternMinBreakPct;
    const broke = this.direction === PatternDirectionEnum.Bullish
      ? current.close > rangeHigh + breakThreshold
      : current.close < rangeLow - breakThreshold;
    if (!broke) return [];

    const entry = current.close;
    const stop = this.direction === PatternDirectionEnum.Bullish ? rangeLow : rangeHigh;

    return [{
      id: this.id,
      direction: this.direction,
      confidence: this.baseConfidence,
      price: current.close,
      entry,
      stop,
      targets: calculateTargets(entry, risk, this.direction === PatternDirectionEnum.Bullish ? 'up' : 'down'),
      meta: { rangeHigh, rangeLow },
    }];
  }
}
