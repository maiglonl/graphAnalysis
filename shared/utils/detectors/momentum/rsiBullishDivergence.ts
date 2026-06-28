import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { getLastSwingLow, rsi } from '#shared/utils/indicators';
import type { ScanContext } from '#shared/utils/scanContext';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { MomentumPatternDetector } from './MomentumPatternDetector';

export class RsiBullishDivergenceDetector extends MomentumPatternDetector {
  detect(ctx: ScanContext) {
    const current = ctx.currentCandle;
    if (!current || ctx.index < EXTRA_THRESHOLDS.divergenceLookback) return [];

    const lastSwingLow = getLastSwingLow(ctx.candles, ctx.index);
    if (!lastSwingLow) return [];
    if (ctx.index - lastSwingLow.index > EXTRA_THRESHOLDS.divergenceLookback) return [];

    const priorSwingLow = getLastSwingLow(ctx.candles, lastSwingLow.index);
    if (!priorSwingLow) return [];
    if (lastSwingLow.price >= priorSwingLow.price) return [];

    const rsiValues = rsi(ctx.candles.map((c) => c.close));
    const rsiAtLast = rsiValues[lastSwingLow.index];
    const rsiAtPrior = rsiValues[priorSwingLow.index];
    if (
      rsiAtLast === undefined || rsiAtPrior === undefined ||
      !Number.isFinite(rsiAtLast) || !Number.isFinite(rsiAtPrior) ||
      rsiAtLast <= rsiAtPrior
    ) return [];

    return this.buildSignal(
      ctx,
      PatternIdEnum.RsiBullishDivergence,
      PatternDirectionEnum.Bullish,
      EXTRA_CONFIDENCE.rsiBullishDivergence,
      { rsi: rsiAtLast, previousRsi: rsiAtPrior },
    );
  }
}
