import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { getLiquidityRange } from './liquidityHelpers';

export class LiquiditySweepLowDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    const range = current ? getLiquidityRange(ctx.candles, ctx.index) : null;
    if (!current || !range) return [];

    const sweepThreshold = range.low * EXTRA_THRESHOLDS.sweepCloseBackPct;
    if (current.low >= range.low || current.close <= range.low + sweepThreshold) return [];

    const risk = current.close - current.low;
    if (risk <= 0) return [];
    const entry = current.close;

    return [{
      id: PatternIdEnum.LiquiditySweepLow,
      direction: PatternDirectionEnum.Bullish,
      confidence: EXTRA_CONFIDENCE.liquiditySweepLow,
      price: current.close,
      entry,
      stop: current.low,
      targets: calculateTargets(entry, risk, 'up'),
      meta: { sweptLevel: range.low },
    }];
  }
}
