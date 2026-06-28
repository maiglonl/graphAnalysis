import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { getLiquidityRange } from './liquidityHelpers';

export class StopHuntHighDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    const range = current ? getLiquidityRange(ctx.candles, ctx.index) : null;
    if (!current || !range) return [];

    const wickSize = current.high - Math.max(current.open, current.close);
    const rangeSize = current.high - current.low;
    if (
      current.high <= range.high ||
      current.close >= range.high ||
      rangeSize <= 0 ||
      wickSize / rangeSize < EXTRA_THRESHOLDS.continuationPullbackMaxBodyPct
    ) return [];

    const risk = current.high - current.close;
    if (risk <= 0) return [];
    const entry = current.close;

    return [{
      id: PatternIdEnum.StopHuntHigh,
      direction: PatternDirectionEnum.Bearish,
      confidence: EXTRA_CONFIDENCE.stopHuntHigh,
      price: current.close,
      entry,
      stop: current.high,
      targets: calculateTargets(entry, risk, 'down'),
      meta: { huntedLevel: range.high },
    }];
  }
}
