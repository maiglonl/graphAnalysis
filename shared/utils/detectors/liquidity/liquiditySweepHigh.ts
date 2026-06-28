import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { getLiquidityRange } from './liquidityHelpers';

export class LiquiditySweepHighDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    const range = current ? getLiquidityRange(ctx.candles, ctx.index) : null;
    if (!current || !range) return [];

    const sweepThreshold = range.high * EXTRA_THRESHOLDS.sweepCloseBackPct;
    if (current.high <= range.high || current.close >= range.high - sweepThreshold) return [];

    const risk = current.high - current.close;
    if (risk <= 0) return [];
    const entry = current.close;

    return [{
      id: PatternIdEnum.LiquiditySweepHigh,
      direction: PatternDirectionEnum.Bearish,
      confidence: EXTRA_CONFIDENCE.liquiditySweepHigh,
      price: current.close,
      entry,
      stop: current.high,
      targets: calculateTargets(entry, risk, 'down'),
      meta: { sweptLevel: range.high },
    }];
  }
}
