import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { areNear, getLiquidityRange } from './liquidityHelpers';

export class EqualLowsDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    const range = current ? getLiquidityRange(ctx.candles, ctx.index) : null;
    if (!current || !range || !areNear(current.low, range.low)) return [];

    return [{
      id: PatternIdEnum.EqualLows,
      direction: PatternDirectionEnum.Neutral,
      confidence: EXTRA_CONFIDENCE.equalLows,
      price: current.close,
      meta: { level: range.low },
    }];
  }
}
