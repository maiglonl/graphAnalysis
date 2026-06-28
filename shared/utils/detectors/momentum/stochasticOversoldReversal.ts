import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { stochastic } from '#shared/utils/indicators';
import type { ScanContext } from '#shared/utils/scanContext';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { MomentumPatternDetector } from './MomentumPatternDetector';

export class StochasticOversoldReversalDetector extends MomentumPatternDetector {
  detect(ctx: ScanContext) {
    if (!ctx.currentCandle || ctx.index < 1) return [];
    const values = stochastic(ctx.candles);
    const prevK = values.k[ctx.index - 1];
    const prevD = values.d[ctx.index - 1];
    const currK = values.k[ctx.index];
    const currD = values.d[ctx.index];
    if (
      prevK === undefined || prevD === undefined || currK === undefined || currD === undefined ||
      prevK > EXTRA_THRESHOLDS.stochasticOversold ||
      prevK > prevD ||
      currK <= currD
    ) return [];
    return this.buildSignal(ctx, PatternIdEnum.StochasticOversoldReversal, PatternDirectionEnum.Bullish, EXTRA_CONFIDENCE.stochasticOversoldReversal);
  }
}
