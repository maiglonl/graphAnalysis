import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { candleParts, calculateTargets } from '../helpers';
import { CONFIDENCE, THRESHOLDS } from '../constants';

export class ShootingStarDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.ShootingStar;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = CONFIDENCE.shootingStar;

  protected override match(candles: Candle[], index: number, ctx: ScanContext) {
    const candle = candles[index];
    if (!candle) return null;
    if (ctx.trend() !== StructureTrendEnum.Bullish) return null;

    const parts = candleParts(candle);
    const valid =
      parts.range > 0 &&
      parts.bodyPct <= THRESHOLDS.pinBarMaxBodyPct &&
      parts.upperShadow >= parts.body * THRESHOLDS.pinBarMinShadowRatio &&
      parts.lowerShadow <= parts.body * THRESHOLDS.pinBarMaxMinorShadow &&
      parts.closePosition <= THRESHOLDS.shootingStarMaxClosePosition;

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
