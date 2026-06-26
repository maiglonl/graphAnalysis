import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { isDowntrend } from '#shared/utils/indicators';
import { CandlePatternDetector } from '../base';
import { candleParts, round } from '../helpers';

export class HammerDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.Hammer;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = 68;

  protected override match(candles: Candle[], index: number) {
    const candle = candles[index];
    if (!candle) return null;
    const p = candleParts(candle);
    const valid =
      isDowntrend(candles, index) &&
      p.range > 0 &&
      p.bodyPct <= 0.35 &&
      p.lowerShadow >= p.body * 2 &&
      p.upperShadow <= p.body * 0.25 &&
      p.closePosition >= 0.55;
    if (!valid) return null;
    return {
      price: candle.close,
      entry: candle.high,
      stop: candle.low,
      targets: [
        round(candle.high + (candle.high - candle.low) * 2),
        round(candle.high + (candle.high - candle.low) * 3),
      ],
    };
  }
}
