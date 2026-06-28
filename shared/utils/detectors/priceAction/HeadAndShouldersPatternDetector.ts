import type { PatternSignal, SwingPoint } from '#shared/types/market';
import { PatternDirectionEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { getSwingHighs, getSwingLows } from '#shared/utils/marketStructure';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';

export abstract class HeadAndShouldersPatternDetector extends PatternDetector {
  protected abstract readonly id: PatternSignal['id'];
  protected abstract readonly direction: PatternDirectionEnum;
  protected abstract readonly baseConfidence: number;

  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current) return [];

    const highs = getSwingHighs(ctx.candles, ctx.index, 3);
    const lows = getSwingLows(ctx.candles, ctx.index, 3);
    if (highs.length < 3 || lows.length === 0) return [];

    const patternOk = this.direction === PatternDirectionEnum.Bearish
      ? this.matchesRegular(highs)
      : this.matchesInverse(lows);
    if (!patternOk) return [];

    const neckline = this.direction === PatternDirectionEnum.Bearish ? lows[0]!.price : highs[0]!.price;
    const breakThreshold = neckline * EXTRA_THRESHOLDS.swingPatternMinBreakPct;
    const hasBreak = this.direction === PatternDirectionEnum.Bearish
      ? current.close < neckline - breakThreshold
      : current.close > neckline + breakThreshold;
    if (!hasBreak) return [];

    const head = this.direction === PatternDirectionEnum.Bearish
      ? Math.max(...highs.slice(0, 3).map((swing) => swing.price))
      : Math.min(...lows.slice(0, 3).map((swing) => swing.price));
    const risk = Math.abs(head - neckline);
    if (risk <= 0) return [];

    const entry = current.close;
    const stop = head;

    return [{
      id: this.id,
      direction: this.direction,
      confidence: this.baseConfidence,
      price: current.close,
      entry,
      stop,
      targets: calculateTargets(entry, risk, this.direction === PatternDirectionEnum.Bearish ? 'down' : 'up'),
      meta: { neckline, head },
    }];
  }

  private matchesRegular(highs: SwingPoint[]): boolean {
    const [rightShoulder, head, leftShoulder] = highs;
    if (!rightShoulder || !head || !leftShoulder) return false;

    const shoulderAverage = (leftShoulder.price + rightShoulder.price) / 2;
    if (!this.areSimilarShoulders(leftShoulder.price, rightShoulder.price, shoulderAverage)) return false;
    return head.price > shoulderAverage * (1 + EXTRA_THRESHOLDS.headProminencePct);
  }

  private matchesInverse(lows: SwingPoint[]): boolean {
    const [rightShoulder, head, leftShoulder] = lows;
    if (!rightShoulder || !head || !leftShoulder) return false;

    const shoulderAverage = (leftShoulder.price + rightShoulder.price) / 2;
    if (!this.areSimilarShoulders(leftShoulder.price, rightShoulder.price, shoulderAverage)) return false;
    return head.price < shoulderAverage * (1 - EXTRA_THRESHOLDS.headProminencePct);
  }

  private areSimilarShoulders(left: number, right: number, average: number): boolean {
    if (average <= 0) return false;
    return Math.abs(left - right) / average <= EXTRA_THRESHOLDS.shoulderTolerancePct;
  }
}
