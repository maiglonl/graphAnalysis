import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';

export class OrderBlockBullishDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current || ctx.index < EXTRA_THRESHOLDS.orderBlockLookback) return [];

    const previous = ctx.candles[ctx.index - 1];
    if (!previous || previous.close >= previous.open) return [];

    const reference = ctx.candles.slice(ctx.index - EXTRA_THRESHOLDS.orderBlockLookback, ctx.index - 1);
    const rangeHigh = Math.max(...reference.map((candle) => candle.high));
    const impulsePct = (current.close - previous.close) / previous.close;
    if (current.close <= rangeHigh || impulsePct < EXTRA_THRESHOLDS.orderBlockMinImpulsePct) return [];

    const entry = current.close;
    const stop = previous.low;
    const risk = entry - stop;
    if (risk <= 0) return [];

    return [{
      id: PatternIdEnum.OrderBlockBullish,
      direction: PatternDirectionEnum.Bullish,
      confidence: EXTRA_CONFIDENCE.orderBlockBullish,
      price: current.close,
      entry,
      stop,
      targets: calculateTargets(entry, risk, 'up'),
      meta: { blockHigh: previous.high, blockLow: previous.low },
    }];
  }
}
