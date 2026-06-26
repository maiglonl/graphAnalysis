import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { round } from '../helpers';

export class InsideBarDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.InsideBar;
  override readonly direction = PatternDirectionEnum.Neutral;
  override readonly baseConfidence = 55;

  protected override match(candles: Candle[], index: number) {
    if (index < 1) return null;
    const mother = candles[index - 1];
    const current = candles[index];
    if (!mother || !current) return null;
    if (!(current.high <= mother.high && current.low >= mother.low)) return null;
    return {
      price: current.close,
      entry: mother.high,
      stop: mother.low,
      targets: [
        round(mother.high + (mother.high - mother.low) * 1.5),
        round(mother.high + (mother.high - mother.low) * 2),
      ],
    };
  }
}
