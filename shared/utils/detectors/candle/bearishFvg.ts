import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { atr } from '#shared/utils/indicators';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { round } from '../helpers';

export class BearishFvgDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.BearishFvg;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = 70;

  protected override match(candles: Candle[], index: number) {
    if (index < 2) return null;
    const c1 = candles[index - 2];
    const c2 = candles[index - 1];
    const c3 = candles[index];
    if (!c1 || !c2 || !c3) return null;
    const currentAtr = atr(candles)[index] ?? 0;
    const gap = c1.low - c3.high;
    if (!(gap > 0 && gap >= currentAtr * 0.1 && c2.close < c2.open)) return null;
    return {
      price: c3.close,
      entry: round(c3.high + gap / 2),
      stop: round(c1.low + currentAtr * 0.1),
      targets: [round(c3.close - currentAtr * 2), round(c3.close - currentAtr * 3)],
      meta: { gapStart: c3.high, gapEnd: c1.low, gapSize: gap },
    };
  }
}
