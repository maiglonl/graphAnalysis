import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';

export class CompressionSqueezeDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current) return [];

    const lookback = EXTRA_THRESHOLDS.rangePatternLookback;
    if (ctx.index < lookback) return [];

    const candles = ctx.candles.slice(ctx.index - lookback, ctx.index + 1);
    const high = Math.max(...candles.map((candle) => candle.high));
    const low = Math.min(...candles.map((candle) => candle.low));
    const rangePct = (high - low) / current.close;
    if (rangePct > EXTRA_THRESHOLDS.volatilitySqueezeRangeMaxPct) return [];

    return [{
      id: PatternIdEnum.VolatilitySqueeze,
      direction: PatternDirectionEnum.Neutral,
      confidence: EXTRA_CONFIDENCE.volatilitySqueeze,
      price: current.close,
      meta: { high, low, rangePct },
    }];
  }
}
