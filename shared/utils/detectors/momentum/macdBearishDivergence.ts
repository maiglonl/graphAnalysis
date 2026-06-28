import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { getLastSwingHigh, macd } from '#shared/utils/indicators';
import type { ScanContext } from '#shared/utils/scanContext';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { MomentumPatternDetector } from './MomentumPatternDetector';

export class MacdBearishDivergenceDetector extends MomentumPatternDetector {
  detect(ctx: ScanContext) {
    const current = ctx.currentCandle;
    if (!current || ctx.index < EXTRA_THRESHOLDS.divergenceLookback) return [];

    const lastSwingHigh = getLastSwingHigh(ctx.candles, ctx.index);
    if (!lastSwingHigh) return [];
    if (ctx.index - lastSwingHigh.index > EXTRA_THRESHOLDS.divergenceLookback) return [];

    const priorSwingHigh = getLastSwingHigh(ctx.candles, lastSwingHigh.index);
    if (!priorSwingHigh) return [];
    if (lastSwingHigh.price <= priorSwingHigh.price) return [];

    const histogram = macd(ctx.candles.map((c) => c.close)).histogram;
    const histAtLast = histogram[lastSwingHigh.index];
    const histAtPrior = histogram[priorSwingHigh.index];
    if (
      histAtLast === undefined || histAtPrior === undefined ||
      !Number.isFinite(histAtLast) || !Number.isFinite(histAtPrior) ||
      histAtLast >= histAtPrior
    ) return [];

    return this.buildSignal(
      ctx,
      PatternIdEnum.MacdBearishDivergence,
      PatternDirectionEnum.Bearish,
      EXTRA_CONFIDENCE.macdBearishDivergence,
      { macdHistogram: histAtLast, previousMacdHistogram: histAtPrior },
    );
  }
}
