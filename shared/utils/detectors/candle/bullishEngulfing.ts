import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { isDowntrend } from '#shared/utils/indicators';
import { CandlePatternDetector } from '../base';
import { candleParts, round } from '../helpers';

export class BullishEngulfingDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.BullishEngulfing;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = 74;

  protected override match(candles: Candle[], index: number) {
    if (index < 1) return null;
    const previous = candles[index - 1];
    const current = candles[index];
    if (!previous || !current) return null;
    const prev = candleParts(previous);
    const curr = candleParts(current);
    const valid =
      isDowntrend(candles, index) &&
      prev.isBearish &&
      curr.isBullish &&
      current.open <= previous.close &&
      current.close >= previous.open &&
      curr.body >= prev.body * 1.05 &&
      curr.bodyPct >= 0.5;
    if (!valid) return null;
    const low = Math.min(previous.low, current.low);
    const high = Math.max(previous.high, current.high);
    const risk = high - low;
    return {
      price: current.close,
      entry: high,
      stop: low,
      targets: [round(high + risk * 2), round(high + risk * 3)],
    };
  }
}
