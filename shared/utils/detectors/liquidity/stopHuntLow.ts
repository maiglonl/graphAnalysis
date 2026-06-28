import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { getLiquidityRange } from './liquidityHelpers';

export class StopHuntLowDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    const range = current ? getLiquidityRange(ctx.candles, ctx.index) : null;
    if (!current || !range) return [];

    const wickSize = Math.min(current.open, current.close) - current.low;
    const rangeSize = current.high - current.low;
    if (
      current.low >= range.low ||
      current.close <= range.low ||
      rangeSize <= 0 ||
      wickSize / rangeSize < EXTRA_THRESHOLDS.continuationPullbackMaxBodyPct
    ) return [];

    const risk = current.close - current.low;
    if (risk <= 0) return [];
    const entry = current.close;

    return [{
      id: PatternIdEnum.StopHuntLow,
      direction: PatternDirectionEnum.Bullish,
      confidence: EXTRA_CONFIDENCE.stopHuntLow,
      price: current.close,
      entry,
      stop: current.low,
      targets: calculateTargets(entry, risk, 'up'),
      meta: { huntedLevel: range.low },
    }];
  }
}
