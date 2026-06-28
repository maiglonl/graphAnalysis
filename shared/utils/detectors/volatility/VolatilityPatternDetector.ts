import type { PatternSignal } from '#shared/types/market';
import { PatternDirectionEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';

export abstract class VolatilityPatternDetector extends PatternDetector {
  protected abstract readonly id: PatternSignal['id'];
  protected abstract readonly direction: PatternDirectionEnum;
  protected abstract readonly baseConfidence: number;
  protected abstract matches(ctx: ScanContext): boolean;

  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current || !this.matches(ctx)) return [];

    const risk = Math.max(ctx.currentAtr, current.high - current.low);
    if (risk <= 0) return [];

    const entry = current.close;
    const stop = this.direction === PatternDirectionEnum.Bullish ? entry - risk : entry + risk;

    return [{
      id: this.id,
      direction: this.direction,
      confidence: this.baseConfidence,
      price: current.close,
      entry,
      stop,
      targets: calculateTargets(entry, risk, this.direction === PatternDirectionEnum.Bullish ? 'up' : 'down'),
      meta: { atr: ctx.currentAtr },
    }];
  }
}
