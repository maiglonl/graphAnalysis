import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { candleParts, calculateTargets } from '../helpers';
import { CONFIDENCE, THRESHOLDS } from '../constants';

export class HammerDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.Hammer;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = CONFIDENCE.hammer;

  protected override match(candles: Candle[], index: number, ctx: ScanContext) {
    const candle = candles[index];
    if (!candle) return null;
    if (ctx.trend() !== StructureTrendEnum.Bearish) return null;

    const parts = candleParts(candle);
    const valid =
      parts.range > 0 &&
      parts.bodyPct <= THRESHOLDS.pinBarMaxBodyPct &&
      parts.lowerShadow >= parts.body * THRESHOLDS.pinBarMinShadowRatio &&
      parts.upperShadow <= parts.body * THRESHOLDS.pinBarMaxMinorShadow &&
      parts.closePosition >= THRESHOLDS.hammerMinClosePosition;

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
