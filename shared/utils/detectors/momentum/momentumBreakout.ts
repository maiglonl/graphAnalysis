import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';

export class MomentumBreakoutDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current) return [];

    const lookback = EXTRA_THRESHOLDS.momentumBreakoutLookback;
    if (ctx.index < lookback) return [];

    const previous = ctx.candles.slice(ctx.index - lookback, ctx.index);
    const high = Math.max(...previous.map((candle) => candle.high));
    const low = Math.min(...previous.map((candle) => candle.low));
    const direction = current.close > high
      ? PatternDirectionEnum.Bullish
      : current.close < low
        ? PatternDirectionEnum.Bearish
        : null;
    if (!direction) return [];

    const risk = Math.max(ctx.currentAtr, high - low);
    if (risk <= 0) return [];
    const entry = current.close;

    return [{
      id: PatternIdEnum.MomentumBreakout,
      direction,
      confidence: EXTRA_CONFIDENCE.momentumBreakout,
      price: current.close,
      entry,
      stop: direction === PatternDirectionEnum.Bullish ? entry - risk : entry + risk,
      targets: calculateTargets(entry, risk, direction === PatternDirectionEnum.Bullish ? 'up' : 'down'),
      meta: { high, low },
    }];
  }
}
