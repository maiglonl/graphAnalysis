import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { MomentumPatternDetector } from './MomentumPatternDetector';

export class MomentumBreakoutDetector extends MomentumPatternDetector {
  detect(ctx: ScanContext) {
    const current = ctx.currentCandle;
    if (!current) return [];
    const lookback = EXTRA_THRESHOLDS.momentumBreakoutLookback;
    if (ctx.index < lookback) return [];
    const previous = ctx.candles.slice(ctx.index - lookback, ctx.index);
    const high = Math.max(...previous.map((c) => c.high));
    const low = Math.min(...previous.map((c) => c.low));
    const direction = current.close > high
      ? PatternDirectionEnum.Bullish
      : current.close < low
        ? PatternDirectionEnum.Bearish
        : null;
    if (!direction) return [];
    return this.buildSignal(
      ctx,
      PatternIdEnum.MomentumBreakout,
      direction,
      EXTRA_CONFIDENCE.momentumBreakout,
      { high, low },
      Math.max(ctx.currentAtr, high - low),
    );
  }
}
