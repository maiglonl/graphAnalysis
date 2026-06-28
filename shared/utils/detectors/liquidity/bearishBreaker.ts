import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';

export class BearishBreakerDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current || ctx.index < EXTRA_THRESHOLDS.orderBlockLookback) return [];

    const candles = ctx.candles.slice(ctx.index - EXTRA_THRESHOLDS.orderBlockLookback, ctx.index);
    const brokenLow = Math.min(...candles.map((candle) => candle.low));
    const retestTolerance = current.close * EXTRA_THRESHOLDS.breakerRetestTolerancePct;
    const retested = current.high >= brokenLow - retestTolerance && current.close < brokenLow;
    if (!retested || current.close >= current.open) return [];

    const entry = current.close;
    const stop = current.high;
    const risk = stop - entry;
    if (risk <= 0) return [];

    return [{
      id: PatternIdEnum.BreakerBlockBearish,
      direction: PatternDirectionEnum.Bearish,
      confidence: EXTRA_CONFIDENCE.breakerBlockBearish,
      price: current.close,
      entry,
      stop,
      targets: calculateTargets(entry, risk, 'down'),
      meta: { brokenLevel: brokenLow },
    }];
  }
}
