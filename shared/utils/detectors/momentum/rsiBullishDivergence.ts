import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import { rsi } from '#shared/utils/indicators';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';

export class RsiBullishDivergenceDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current) return [];

    const lookback = EXTRA_THRESHOLDS.divergenceLookback;
    if (ctx.index < lookback) return [];

    const closes = ctx.candles.map((candle) => candle.close);
    const values = rsi(closes);
    const currentRsi = values[ctx.index];
    const previousIndex = ctx.index - lookback;
    const previousClose = closes[previousIndex];
    const previousRsi = values[previousIndex];

    if (
      previousClose === undefined || previousRsi === undefined || currentRsi === undefined ||
      !Number.isFinite(previousRsi) || !Number.isFinite(currentRsi) ||
      current.close >= previousClose || currentRsi <= previousRsi
    ) return [];

    const risk = Math.max(ctx.currentAtr, current.high - current.low);
    if (risk <= 0) return [];
    const entry = current.close;

    return [{
      id: PatternIdEnum.RsiBullishDivergence,
      direction: PatternDirectionEnum.Bullish,
      confidence: EXTRA_CONFIDENCE.rsiBullishDivergence,
      price: current.close,
      entry,
      stop: entry - risk,
      targets: calculateTargets(entry, risk, 'up'),
      meta: { rsi: currentRsi, previousRsi },
    }];
  }
}
