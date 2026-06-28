import type { PatternSignal } from '#shared/types/market';
import { PatternDirectionEnum, StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';

export abstract class LowVolumePullbackDetector extends PatternDetector {
  protected abstract readonly id: PatternSignal['id'];
  protected abstract readonly direction: PatternDirectionEnum;
  protected abstract readonly baseConfidence: number;

  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current) return [];

    const trendOk = this.direction === PatternDirectionEnum.Bullish
      ? ctx.trend() === StructureTrendEnum.Bullish && current.close < current.open
      : ctx.trend() === StructureTrendEnum.Bearish && current.close > current.open;
    if (!trendOk || ctx.currentRelativeVolume > EXTRA_THRESHOLDS.lowVolumeRelativeMax) return [];

    const risk = current.high - current.low;
    if (risk <= 0) return [];

    const entry = current.close;
    const stop = this.direction === PatternDirectionEnum.Bullish ? current.low : current.high;

    return [{
      id: this.id,
      direction: this.direction,
      confidence: this.baseConfidence,
      price: current.close,
      entry,
      stop,
      targets: calculateTargets(entry, risk, this.direction === PatternDirectionEnum.Bullish ? 'up' : 'down'),
      meta: { relativeVolume: ctx.currentRelativeVolume },
    }];
  }
}
