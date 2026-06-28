import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { rsi } from '#shared/utils/indicators';
import type { ScanContext } from '#shared/utils/scanContext';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { MomentumPatternDetector } from './MomentumPatternDetector';

export class MomentumExhaustionDetector extends MomentumPatternDetector {
  detect(ctx: ScanContext) {
    const current = ctx.currentCandle;
    if (!current) return [];
    const values = rsi(ctx.candles.map((c) => c.close));
    const currentRsi = values[ctx.index];
    if (currentRsi === undefined || !Number.isFinite(currentRsi)) return [];
    const extreme = EXTRA_THRESHOLDS.momentumExhaustionRsiExtreme;
    const direction = currentRsi >= extreme && current.close < current.open
      ? PatternDirectionEnum.Bearish
      : currentRsi <= 100 - extreme && current.close > current.open
        ? PatternDirectionEnum.Bullish
        : null;
    if (!direction) return [];
    return this.buildSignal(ctx, PatternIdEnum.MomentumExhaustion, direction, EXTRA_CONFIDENCE.momentumExhaustion, { rsi: currentRsi });
  }
}
