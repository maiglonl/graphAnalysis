import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { getLastSwingLow, macd } from '#shared/utils/indicators';
import type { ScanContext } from '#shared/utils/scanContext';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { MomentumPatternDetector } from './MomentumPatternDetector';

export class MacdBullishDivergenceDetector extends MomentumPatternDetector {
  detect(ctx: ScanContext) {
    const current = ctx.currentCandle;
    if (!current || ctx.index < EXTRA_THRESHOLDS.divergenceLookback) return [];

    const lastSwingLow = getLastSwingLow(ctx.candles, ctx.index);
    if (!lastSwingLow) return [];
    if (ctx.index - lastSwingLow.index > EXTRA_THRESHOLDS.divergenceLookback) return [];

    const priorSwingLow = getLastSwingLow(ctx.candles, lastSwingLow.index);
    if (!priorSwingLow) return [];
    if (lastSwingLow.price >= priorSwingLow.price) return [];

    const histogram = macd(ctx.candles.map((c) => c.close)).histogram;
    const histAtLast = histogram[lastSwingLow.index];
    const histAtPrior = histogram[priorSwingLow.index];
    if (
      histAtLast === undefined || histAtPrior === undefined ||
      !Number.isFinite(histAtLast) || !Number.isFinite(histAtPrior) ||
      histAtLast <= histAtPrior
    ) return [];

    return this.buildSignal(
      ctx,
      PatternIdEnum.MacdBullishDivergence,
      PatternDirectionEnum.Bullish,
      EXTRA_CONFIDENCE.macdBullishDivergence,
      { macdHistogram: histAtLast, previousMacdHistogram: histAtPrior },
    );
  }
}
