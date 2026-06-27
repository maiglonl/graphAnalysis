import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { THRESHOLDS } from '../constants';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { calculateTargets, candleParts } from '../helpers';

export class InvertedHammerDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.InvertedHammer;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.invertedHammer;

  protected override match(candles: Candle[], index: number, ctx: ScanContext) {
    const candle = candles[index];
    if (!candle) return null;
    if (ctx.trend() !== StructureTrendEnum.Bearish) return null;

    const parts = candleParts(candle);
    const valid =
      parts.range > 0 &&
      parts.bodyPct <= THRESHOLDS.pinBarMaxBodyPct &&
      parts.upperShadow >= parts.body * THRESHOLDS.pinBarMinShadowRatio &&
      parts.lowerShadow <= parts.body * THRESHOLDS.pinBarMaxMinorShadow;

    if (!valid) return null;

    const risk = candle.high - candle.low;
    return {
      price: candle.close,
      entry: candle.high,
      stop: candle.low,
      targets: calculateTargets(candle.high, risk, 'up'),
    };
  }
}
