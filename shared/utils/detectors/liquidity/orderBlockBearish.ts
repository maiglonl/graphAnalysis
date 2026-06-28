import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';

export class OrderBlockBearishDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current || ctx.index < EXTRA_THRESHOLDS.orderBlockLookback) return [];

    const previous = ctx.candles[ctx.index - 1];
    if (!previous || previous.close <= previous.open) return [];

    const reference = ctx.candles.slice(ctx.index - EXTRA_THRESHOLDS.orderBlockLookback, ctx.index - 1);
    const rangeLow = Math.min(...reference.map((candle) => candle.low));
    const impulsePct = (previous.close - current.close) / previous.close;
    if (current.close >= rangeLow || impulsePct < EXTRA_THRESHOLDS.orderBlockMinImpulsePct) return [];

    const entry = current.close;
    const stop = previous.high;
    const risk = stop - entry;
    if (risk <= 0) return [];

    return [{
      id: PatternIdEnum.OrderBlockBearish,
      direction: PatternDirectionEnum.Bearish,
      confidence: EXTRA_CONFIDENCE.orderBlockBearish,
      price: current.close,
      entry,
      stop,
      targets: calculateTargets(entry, risk, 'down'),
      meta: { blockHigh: previous.high, blockLow: previous.low },
    }];
  }
}
