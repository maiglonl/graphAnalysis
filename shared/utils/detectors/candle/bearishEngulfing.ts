import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { isUptrend } from '#shared/utils/indicators';
import { CandlePatternDetector } from '../base';
import { candleParts, round } from '../helpers';

export class BearishEngulfingDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.BearishEngulfing;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = 74;

  protected override match(candles: Candle[], index: number) {
    if (index < 1) return null;
    const previous = candles[index - 1];
    const current = candles[index];
    if (!previous || !current) return null;
    const prev = candleParts(previous);
    const curr = candleParts(current);
    const valid =
      isUptrend(candles, index) &&
      prev.isBullish &&
      curr.isBearish &&
      current.open >= previous.close &&
      current.close <= previous.open &&
      curr.body >= prev.body * 1.05 &&
      curr.bodyPct >= 0.5;
    if (!valid) return null;
    const low = Math.min(previous.low, current.low);
    const high = Math.max(previous.high, current.high);
    const risk = high - low;
    return {
      price: current.close,
      entry: low,
      stop: high,
      targets: [round(low - risk * 2), round(low - risk * 3)],
    };
  }
}
