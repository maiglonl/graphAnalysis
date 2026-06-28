import type { PatternIdEnum, PatternSignal } from '#shared/types/market';
import { PatternDirectionEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';

export abstract class MomentumPatternDetector extends PatternDetector {
  protected buildSignal(
    ctx: ScanContext,
    id: PatternIdEnum,
    direction: PatternDirectionEnum,
    confidence: number,
    meta?: Record<string, unknown>,
    riskOverride?: number,
  ): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current) return [];
    const risk = riskOverride !== undefined ? riskOverride : Math.max(ctx.currentAtr, current.high - current.low);
    if (risk <= 0) return [];
    const entry = current.close;
    const isBullish = direction === PatternDirectionEnum.Bullish;
    const signal: PatternSignal = {
      id,
      direction,
      confidence,
      price: current.close,
      entry,
      stop: isBullish ? entry - risk : entry + risk,
      targets: calculateTargets(entry, risk, isBullish ? 'up' : 'down'),
    };
    if (meta !== undefined) signal.meta = meta;
    return [signal];
  }
}
