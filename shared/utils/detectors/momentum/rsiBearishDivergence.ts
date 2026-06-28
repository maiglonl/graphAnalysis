import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { getLastSwingHigh, rsi } from '#shared/utils/indicators';
import type { ScanContext } from '#shared/utils/scanContext';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { MomentumPatternDetector } from './MomentumPatternDetector';

export class RsiBearishDivergenceDetector extends MomentumPatternDetector {
  detect(ctx: ScanContext) {
    const current = ctx.currentCandle;
    if (!current || ctx.index < EXTRA_THRESHOLDS.divergenceLookback) return [];

    const lastSwingHigh = getLastSwingHigh(ctx.candles, ctx.index);
    if (!lastSwingHigh) return [];
    if (ctx.index - lastSwingHigh.index > EXTRA_THRESHOLDS.divergenceLookback) return [];

    const priorSwingHigh = getLastSwingHigh(ctx.candles, lastSwingHigh.index);
    if (!priorSwingHigh) return [];
    if (lastSwingHigh.price <= priorSwingHigh.price) return [];

    const rsiValues = rsi(ctx.candles.map((c) => c.close));
    const rsiAtLast = rsiValues[lastSwingHigh.index];
    const rsiAtPrior = rsiValues[priorSwingHigh.index];
    if (
      rsiAtLast === undefined || rsiAtPrior === undefined ||
      !Number.isFinite(rsiAtLast) || !Number.isFinite(rsiAtPrior) ||
      rsiAtLast >= rsiAtPrior
    ) return [];

    return this.buildSignal(
      ctx,
      PatternIdEnum.RsiBearishDivergence,
      PatternDirectionEnum.Bearish,
      EXTRA_CONFIDENCE.rsiBearishDivergence,
      { rsi: rsiAtLast, previousRsi: rsiAtPrior },
    );
  }
}
