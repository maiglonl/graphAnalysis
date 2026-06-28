import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';

export class BullishBreakerDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current || ctx.index < EXTRA_THRESHOLDS.orderBlockLookback) return [];

    const candles = ctx.candles.slice(ctx.index - EXTRA_THRESHOLDS.orderBlockLookback, ctx.index);
    const brokenHigh = Math.max(...candles.map((candle) => candle.high));
    const retestTolerance = current.close * EXTRA_THRESHOLDS.breakerRetestTolerancePct;
    const retested = current.low <= brokenHigh + retestTolerance && current.close > brokenHigh;
    if (!retested || current.close <= current.open) return [];

    const entry = current.close;
    const stop = current.low;
    const risk = entry - stop;
    if (risk <= 0) return [];

    return [{
      id: PatternIdEnum.BreakerBlockBullish,
      direction: PatternDirectionEnum.Bullish,
      confidence: EXTRA_CONFIDENCE.breakerBlockBullish,
      price: current.close,
      entry,
      stop,
      targets: calculateTargets(entry, risk, 'up'),
      meta: { brokenLevel: brokenHigh },
    }];
  }
}
