import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { macd } from '#shared/utils/indicators';
import type { ScanContext } from '#shared/utils/scanContext';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { MomentumPatternDetector } from './MomentumPatternDetector';

export class MacdBearishCrossDetector extends MomentumPatternDetector {
  detect(ctx: ScanContext) {
    if (!ctx.currentCandle || ctx.index < 1) return [];
    const closes = ctx.candles.map((c) => c.close);
    const values = macd(closes);
    const prevMacd = values.macd[ctx.index - 1];
    const prevSignal = values.signal[ctx.index - 1];
    const currMacd = values.macd[ctx.index];
    const currSignal = values.signal[ctx.index];
    if (
      prevMacd === undefined || prevSignal === undefined ||
      currMacd === undefined || currSignal === undefined ||
      !Number.isFinite(prevMacd) || !Number.isFinite(prevSignal) ||
      !Number.isFinite(currMacd) || !Number.isFinite(currSignal) ||
      prevMacd < prevSignal || currMacd >= currSignal
    ) return [];
    return this.buildSignal(ctx, PatternIdEnum.MacdBearishCross, PatternDirectionEnum.Bearish, EXTRA_CONFIDENCE.macdBearishCross);
  }
}
