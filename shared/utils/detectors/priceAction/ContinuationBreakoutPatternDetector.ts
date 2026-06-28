import type { Candle, PatternSignal } from '#shared/types/market';
import { PatternDirectionEnum, StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';

export enum ContinuationBreakoutShapeEnum {
  Flag = 'flag',
  Pennant = 'pennant',
}

export abstract class ContinuationBreakoutPatternDetector extends PatternDetector {
  protected abstract readonly id: PatternSignal['id'];
  protected abstract readonly direction: PatternDirectionEnum;
  protected abstract readonly baseConfidence: number;
  protected abstract readonly shape: ContinuationBreakoutShapeEnum;

  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current) return [];
    if (!this.matchesTrend(ctx)) return [];

    const lookback = EXTRA_THRESHOLDS.continuationPatternLookback;
    if (ctx.index < lookback) return [];

    const consolidation = ctx.candles.slice(ctx.index - lookback, ctx.index);
    if (consolidation.length < lookback) return [];
    if (!this.matchesShape(consolidation)) return [];

    const high = Math.max(...consolidation.map((candle) => candle.high));
    const low = Math.min(...consolidation.map((candle) => candle.low));
    const breakThreshold = current.close * EXTRA_THRESHOLDS.swingPatternMinBreakPct;
    const breakout = this.direction === PatternDirectionEnum.Bullish
      ? current.close > high + breakThreshold
      : current.close < low - breakThreshold;
    if (!breakout) return [];

    const risk = high - low;
    if (risk <= 0) return [];

    const entry = current.close;
    const stop = this.direction === PatternDirectionEnum.Bullish ? low : high;

    return [{
      id: this.id,
      direction: this.direction,
      confidence: this.baseConfidence,
      price: current.close,
      entry,
      stop,
      targets: calculateTargets(entry, risk, this.direction === PatternDirectionEnum.Bullish ? 'up' : 'down'),
      meta: { high, low, shape: this.shape },
    }];
  }

  private matchesTrend(ctx: ScanContext): boolean {
    const trend = ctx.trend();
    return this.direction === PatternDirectionEnum.Bullish
      ? trend === StructureTrendEnum.Bullish
      : trend === StructureTrendEnum.Bearish;
  }

  private matchesShape(candles: Candle[]): boolean {
    const high = Math.max(...candles.map((candle) => candle.high));
    const low = Math.min(...candles.map((candle) => candle.low));
    const close = candles[candles.length - 1]?.close ?? 0;
    if (close <= 0 || high <= low) return false;

    const rangePct = (high - low) / close;
    if (this.shape === ContinuationBreakoutShapeEnum.Flag) {
      return rangePct <= EXTRA_THRESHOLDS.flagMaxRetracementPct;
    }

    if (rangePct > EXTRA_THRESHOLDS.pennantMaxRangePct) return false;
    const midpoint = Math.floor(candles.length / 2);
    const firstHalf = candles.slice(0, midpoint);
    const secondHalf = candles.slice(midpoint);
    return this.range(secondHalf) <= this.range(firstHalf) * EXTRA_THRESHOLDS.pennantCompressionFactor;
  }

  private range(candles: Candle[]): number {
    if (candles.length === 0) return 0;
    return Math.max(...candles.map((candle) => candle.high)) - Math.min(...candles.map((candle) => candle.low));
  }
}
