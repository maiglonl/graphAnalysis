import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { THRESHOLDS } from '../constants';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { calculateTargets, candleParts } from '../helpers';

export class HangingManDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.HangingMan;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.hangingMan;

  protected override match(candles: Candle[], index: number, ctx: ScanContext) {
    const candle = candles[index];
    if (!candle) return null;
    if (ctx.trend() !== StructureTrendEnum.Bullish) return null;

    const parts = candleParts(candle);
    const valid =
      parts.range > 0 &&
      parts.bodyPct <= THRESHOLDS.pinBarMaxBodyPct &&
      parts.lowerShadow >= parts.body * THRESHOLDS.pinBarMinShadowRatio &&
      parts.upperShadow <= parts.body * THRESHOLDS.pinBarMaxMinorShadow;

    if (!valid) return null;

    const risk = candle.high - candle.low;
    return {
      price: candle.close,
      entry: candle.low,
      stop: candle.high,
      targets: calculateTargets(candle.low, risk, 'down'),
    };
  }
}
