import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import { macd } from '#shared/utils/indicators';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';

export class MacdBullishCrossDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current || ctx.index < 1) return [];

    const closes = ctx.candles.map((candle) => candle.close);
    const values = macd(closes);
    const previousMacd = values.macd[ctx.index - 1];
    const previousSignal = values.signal[ctx.index - 1];
    const currentMacd = values.macd[ctx.index];
    const currentSignal = values.signal[ctx.index];

    if (
      previousMacd === undefined || previousSignal === undefined ||
      currentMacd === undefined || currentSignal === undefined ||
      !Number.isFinite(previousMacd) || !Number.isFinite(previousSignal) ||
      !Number.isFinite(currentMacd) || !Number.isFinite(currentSignal) ||
      previousMacd > previousSignal || currentMacd <= currentSignal
    ) return [];

    const risk = Math.max(ctx.currentAtr, current.high - current.low);
    if (risk <= 0) return [];
    const entry = current.close;

    return [{
      id: PatternIdEnum.MacdBullishCross,
      direction: PatternDirectionEnum.Bullish,
      confidence: EXTRA_CONFIDENCE.macdBullishCross,
      price: current.close,
      entry,
      stop: entry - risk,
      targets: calculateTargets(entry, risk, 'up'),
    }];
  }
}
