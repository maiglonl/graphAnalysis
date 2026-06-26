import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { CandlePatternDetector } from '../base';
import { candleParts } from '../helpers';

export class DojiDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.Doji;
  override readonly direction = PatternDirectionEnum.Neutral;
  override readonly baseConfidence = 45;

  protected override match(candles: Candle[], index: number) {
    const candle = candles[index];
    if (!candle) return null;
    const p = candleParts(candle);
    if (p.range <= 0 || p.bodyPct > 0.1) return null;
    return { price: candle.close };
  }
}
