import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { VolatilityPatternDetector } from './VolatilityPatternDetector';

export class AtrExpansionBreakoutDetector extends VolatilityPatternDetector {
  protected override readonly id = PatternIdEnum.AtrExpansionBreakout;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.atrExpansionBreakout;
  protected override readonly direction = PatternDirectionEnum.Bullish;

  override detect(ctx: ScanContext) {
    const current = ctx.currentCandle;
    if (!current || !this.matches(ctx)) return [];

    const previousHigh = Math.max(...ctx.candles.slice(0, ctx.index).map((candle) => candle.high));
    const previousLow = Math.min(...ctx.candles.slice(0, ctx.index).map((candle) => candle.low));
    const direction = current.close > previousHigh ? PatternDirectionEnum.Bullish : PatternDirectionEnum.Bearish;
    const risk = Math.max(ctx.currentAtr, current.high - current.low);
    const entry = current.close;
    const stop = direction === PatternDirectionEnum.Bullish ? entry - risk : entry + risk;

    return [{
      id: this.id,
      direction,
      confidence: this.baseConfidence,
      price: current.close,
      entry,
      stop,
      targets: direction === PatternDirectionEnum.Bullish ? [entry + risk, entry + risk * 2, entry + risk * 3] : [entry - risk, entry - risk * 2, entry - risk * 3],
      meta: { atr: ctx.currentAtr, previousHigh, previousLow },
    }];
  }

  protected override matches(ctx: ScanContext): boolean {
    const current = ctx.currentCandle;
    if (!current || ctx.index < 1 || ctx.currentAtr <= 0) return false;

    const previousAtr = ctx.atr14[ctx.index - 1] ?? 0;
    if (previousAtr <= 0 || ctx.currentAtr / previousAtr < EXTRA_THRESHOLDS.atrExpansionRatioMin) return false;

    const previousCandles = ctx.candles.slice(0, ctx.index);
    const previousHigh = Math.max(...previousCandles.map((candle) => candle.high));
    const previousLow = Math.min(...previousCandles.map((candle) => candle.low));
    return current.close > previousHigh || current.close < previousLow;
  }
}
