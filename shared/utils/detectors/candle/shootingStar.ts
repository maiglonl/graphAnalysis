import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { isUptrend } from '#shared/utils/indicators';
import { CandlePatternDetector } from '../base';
import { candleParts, round } from '../helpers';

export class ShootingStarDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.ShootingStar;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = 68;

  protected override match(candles: Candle[], index: number) {
    const candle = candles[index];
    if (!candle) return null;
    const p = candleParts(candle);
    const valid =
      isUptrend(candles, index) &&
      p.range > 0 &&
      p.bodyPct <= 0.35 &&
      p.upperShadow >= p.body * 2 &&
      p.lowerShadow <= p.body * 0.25 &&
      p.closePosition <= 0.45;
    if (!valid) return null;
    return {
      price: candle.close,
      entry: candle.low,
      stop: candle.high,
      targets: [
        round(candle.low - (candle.high - candle.low) * 2),
        round(candle.low - (candle.high - candle.low) * 3),
      ],
    };
  }
}
