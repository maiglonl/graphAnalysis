import type { Candle, PatternSignal } from '#shared/types/market';
import { PatternDirectionEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';

export type TriangleHalves = {
  firstAvgHigh: number;
  firstAvgLow: number;
  secondAvgHigh: number;
  secondAvgLow: number;
  rangeHigh: number;
  rangeLow: number;
};

export abstract class TrianglePatternDetector extends PatternDetector {
  protected abstract readonly id: PatternSignal['id'];
  protected abstract readonly baseConfidence: number;

  protected abstract matchesShape(halves: TriangleHalves): boolean;

  protected abstract getBreakoutDirection(
    current: Candle,
    halves: TriangleHalves,
    breakThreshold: number,
  ): PatternDirectionEnum | null;

  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current) return [];

    const lookback = EXTRA_THRESHOLDS.trianglePatternLookback;
    if (ctx.index < lookback) return [];

    const candles = ctx.candles.slice(ctx.index - lookback, ctx.index);
    if (candles.length < lookback) return [];

    const halves = this.computeHalves(candles);
    if (!this.matchesShape(halves)) return [];

    const breakThreshold = current.close * EXTRA_THRESHOLDS.swingPatternMinBreakPct;
    const direction = this.getBreakoutDirection(current, halves, breakThreshold);
    if (!direction) return [];

    const risk = halves.rangeHigh - halves.rangeLow;
    if (risk <= 0) return [];

    const entry = current.close;
    const stop = direction === PatternDirectionEnum.Bullish ? halves.rangeLow : halves.rangeHigh;

    return [{
      id: this.id,
      direction,
      confidence: this.baseConfidence,
      price: current.close,
      entry,
      stop,
      targets: calculateTargets(entry, risk, direction === PatternDirectionEnum.Bullish ? 'up' : 'down'),
      meta: { ...halves },
    }];
  }

  private computeHalves(candles: Candle[]): TriangleHalves {
    const mid = Math.floor(candles.length / 2);
    const first = candles.slice(0, mid);
    const second = candles.slice(mid);
    const avg = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    return {
      firstAvgHigh: avg(first.map((c) => c.high)),
      firstAvgLow: avg(first.map((c) => c.low)),
      secondAvgHigh: avg(second.map((c) => c.high)),
      secondAvgLow: avg(second.map((c) => c.low)),
      rangeHigh: Math.max(...candles.map((c) => c.high)),
      rangeLow: Math.min(...candles.map((c) => c.low)),
    };
  }
}
