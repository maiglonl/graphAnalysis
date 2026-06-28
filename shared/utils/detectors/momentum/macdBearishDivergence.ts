import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import { macd } from '#shared/utils/indicators';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';

export class MacdBearishDivergenceDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current) return [];

    const lookback = EXTRA_THRESHOLDS.divergenceLookback;
    if (ctx.index < lookback) return [];

    const closes = ctx.candles.map((candle) => candle.close);
    const values = macd(closes).histogram;
    const currentMacd = values[ctx.index];
    const previousIndex = ctx.index - lookback;
    const previousClose = closes[previousIndex];
    const previousMacd = values[previousIndex];

    if (
      previousClose === undefined || previousMacd === undefined || currentMacd === undefined ||
      !Number.isFinite(previousMacd) || !Number.isFinite(currentMacd) ||
      current.close <= previousClose || currentMacd >= previousMacd
    ) return [];

    const risk = Math.max(ctx.currentAtr, current.high - current.low);
    if (risk <= 0) return [];
    const entry = current.close;

    return [{
      id: PatternIdEnum.MacdBearishDivergence,
      direction: PatternDirectionEnum.Bearish,
      confidence: EXTRA_CONFIDENCE.macdBearishDivergence,
      price: current.close,
      entry,
      stop: entry + risk,
      targets: calculateTargets(entry, risk, 'down'),
      meta: { macdHistogram: currentMacd, previousMacdHistogram: previousMacd },
    }];
  }
}
