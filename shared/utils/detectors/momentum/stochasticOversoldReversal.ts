import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import { stochastic } from '#shared/utils/indicators';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';

export class StochasticOversoldReversalDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current || ctx.index < 1) return [];

    const values = stochastic(ctx.candles);
    const previousK = values.k[ctx.index - 1];
    const previousD = values.d[ctx.index - 1];
    const currentK = values.k[ctx.index];
    const currentD = values.d[ctx.index];

    if (
      previousK === undefined || previousD === undefined || currentK === undefined || currentD === undefined ||
      previousK > EXTRA_THRESHOLDS.stochasticOversold ||
      previousK > previousD ||
      currentK <= currentD
    ) return [];

    const risk = Math.max(ctx.currentAtr, current.high - current.low);
    if (risk <= 0) return [];
    const entry = current.close;

    return [{
      id: PatternIdEnum.StochasticOversoldReversal,
      direction: PatternDirectionEnum.Bullish,
      confidence: EXTRA_CONFIDENCE.stochasticOversoldReversal,
      price: current.close,
      entry,
      stop: entry - risk,
      targets: calculateTargets(entry, risk, 'up'),
    }];
  }
}
