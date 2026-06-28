import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import { rsi } from '#shared/utils/indicators';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';

export class MomentumExhaustionDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current) return [];

    const values = rsi(ctx.candles.map((candle) => candle.close));
    const currentRsi = values[ctx.index];
    if (currentRsi === undefined || !Number.isFinite(currentRsi)) return [];

    const direction = currentRsi >= EXTRA_THRESHOLDS.momentumExhaustionRsiExtreme && current.close < current.open
      ? PatternDirectionEnum.Bearish
      : currentRsi <= 100 - EXTRA_THRESHOLDS.momentumExhaustionRsiExtreme && current.close > current.open
        ? PatternDirectionEnum.Bullish
        : null;
    if (!direction) return [];

    const risk = Math.max(ctx.currentAtr, current.high - current.low);
    if (risk <= 0) return [];
    const entry = current.close;

    return [{
      id: PatternIdEnum.MomentumExhaustion,
      direction,
      confidence: EXTRA_CONFIDENCE.momentumExhaustion,
      price: current.close,
      entry,
      stop: direction === PatternDirectionEnum.Bullish ? entry - risk : entry + risk,
      targets: calculateTargets(entry, risk, direction === PatternDirectionEnum.Bullish ? 'up' : 'down'),
      meta: { rsi: currentRsi },
    }];
  }
}
