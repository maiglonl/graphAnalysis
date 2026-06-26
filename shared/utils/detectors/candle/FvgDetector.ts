import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import type { MatchResult } from '../CandlePatternDetector';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { round, calculateTargets } from '../helpers';
import { ATR } from '../constants';

export abstract class FvgDetector extends CandlePatternDetector {
  protected abstract calcGap(c1: Candle, c3: Candle): number;
  protected abstract isMiddleConfirming(c2: Candle): boolean;
  protected abstract calcEntry(c1: Candle, c3: Candle, gap: number): number;
  protected abstract calcStop(c1: Candle, atrValue: number): number;
  protected abstract buildMeta(c1: Candle, c3: Candle, gap: number): Record<string, unknown>;

  protected override match(candles: Candle[], index: number, ctx: ScanContext): MatchResult | null {
    if (index < 2) return null;
    const c1 = candles[index - 2];
    const c2 = candles[index - 1];
    const c3 = candles[index];
    if (!c1 || !c2 || !c3) return null;

    const atrValue = ctx.currentAtr;
    const gap = this.calcGap(c1, c3);

    if (gap <= 0 || gap < atrValue * ATR.fvgGapMinFactor) return null;
    if (!this.isMiddleConfirming(c2)) return null;

    const entry = this.calcEntry(c1, c3, gap);
    const stop = this.calcStop(c1, atrValue);
    const risk = Math.abs(entry - stop);
    const direction = this.direction === PatternDirectionEnum.Bullish ? 'up' : 'down';

    return {
      price: c3.close,
      entry: round(entry),
      stop: round(stop),
      targets: calculateTargets(round(entry), risk, direction),
      meta: {
        ...this.buildMeta(c1, c3, gap),
        fromTime: c1.time,
        toTime: c3.time,
      },
    };
  }
}
