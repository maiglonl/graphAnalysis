import type { PatternSignal } from '#shared/types/market';
import { PatternDirectionEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';

export abstract class RangePatternDetector extends PatternDetector {
  protected abstract readonly id: PatternSignal['id'];
  protected abstract readonly direction: PatternDirectionEnum;
  protected abstract readonly baseConfidence: number;
  protected abstract readonly signalType: 'breakout' | 'rejection';

  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current) return [];

    const lookback = EXTRA_THRESHOLDS.rangePatternLookback;
    if (ctx.index < lookback) return [];

    const rangeCandles = ctx.candles.slice(ctx.index - lookback, ctx.index);
    if (rangeCandles.length < lookback) return [];

    const rangeHigh = Math.max(...rangeCandles.map((c) => c.high));
    const rangeLow = Math.min(...rangeCandles.map((c) => c.low));
    if (rangeHigh <= rangeLow) return [];

    const heightPct = (rangeHigh - rangeLow) / current.close;
    if (heightPct > EXTRA_THRESHOLDS.rangeMaxHeightPct) return [];

    const risk = rangeHigh - rangeLow;
    const entry = current.close;
    const breakThreshold = current.close * EXTRA_THRESHOLDS.swingPatternMinBreakPct;
    const rejectionTolerance = current.close * EXTRA_THRESHOLDS.rangeRejectionTolerancePct;

    if (this.signalType === 'breakout') {
      const broke = this.direction === PatternDirectionEnum.Bullish
        ? current.close > rangeHigh + breakThreshold
        : current.close < rangeLow - breakThreshold;
      if (!broke) return [];

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

    // rejection type
    if (this.direction === PatternDirectionEnum.Bearish) {
      const nearHigh = current.high >= rangeHigh - rejectionTolerance;
      const closedBelow = current.close < rangeHigh;
      if (!nearHigh || !closedBelow) return [];
    } else {
      const nearLow = current.low <= rangeLow + rejectionTolerance;
      const closedAbove = current.close > rangeLow;
      if (!nearLow || !closedAbove) return [];
    }

    const stop = this.direction === PatternDirectionEnum.Bullish ? rangeLow : rangeHigh;
    const riskAmount = Math.abs(entry - stop);
    if (riskAmount <= 0) return [];
    return [{
      id: this.id,
      direction: this.direction,
      confidence: this.baseConfidence,
      price: current.close,
      entry,
      stop,
      targets: calculateTargets(entry, riskAmount, this.direction === PatternDirectionEnum.Bullish ? 'up' : 'down'),
      meta: { rangeHigh, rangeLow },
    }];
  }
}
