import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { calculateTargets } from '../helpers';
import { VolatilityPatternDetector } from './VolatilityPatternDetector';

export class WideRangeCandleDetector extends VolatilityPatternDetector {
  protected override readonly id = PatternIdEnum.WideRangeCandle;
  protected override readonly direction = PatternDirectionEnum.Bullish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.wideRangeCandle;

  override detect(ctx: ScanContext) {
    const current = ctx.currentCandle;
    if (!current || !this.matches(ctx)) return [];

    const direction = current.close >= current.open ? PatternDirectionEnum.Bullish : PatternDirectionEnum.Bearish;
    const risk = current.high - current.low;
    const entry = current.close;
    const stop = direction === PatternDirectionEnum.Bullish ? current.low : current.high;

    return [{
      id: this.id,
      direction,
      confidence: this.baseConfidence,
      price: current.close,
      entry,
      stop,
      targets: calculateTargets(entry, risk, direction === PatternDirectionEnum.Bullish ? 'up' : 'down'),
      meta: { atr: ctx.currentAtr },
    }];
  }

  protected override matches(ctx: ScanContext): boolean {
    const current = ctx.currentCandle;
    if (!current || ctx.currentAtr <= 0) return false;
    return (current.high - current.low) / ctx.currentAtr >= EXTRA_THRESHOLDS.wideRangeAtrRatioMin;
  }
}
