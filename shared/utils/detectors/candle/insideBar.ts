import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { calculateTargets } from '../helpers';
import { CONFIDENCE, TARGET_MULTIPLIERS } from '../constants';

export class InsideBarDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.InsideBar;
  override readonly direction = PatternDirectionEnum.Neutral;
  override readonly baseConfidence = CONFIDENCE.insideBar;

  protected override match(candles: Candle[], index: number, _ctx: ScanContext) {
    if (index < 1) return null;
    const mother = candles[index - 1];
    const current = candles[index];
    if (!mother || !current) return null;
    if (!(current.high <= mother.high && current.low >= mother.low)) return null;

    const risk = mother.high - mother.low;
    return {
      price: current.close,
      entry: mother.high,
      stop: mother.low,
      targets: calculateTargets(mother.high, risk, 'up', TARGET_MULTIPLIERS.insideBar),
    };
  }
}
