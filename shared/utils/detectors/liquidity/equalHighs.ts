import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { areNear, getLiquidityRange } from './liquidityHelpers';

export class EqualHighsDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    const range = current ? getLiquidityRange(ctx.candles, ctx.index) : null;
    if (!current || !range || !areNear(current.high, range.high)) return [];

    return [{
      id: PatternIdEnum.EqualHighs,
      direction: PatternDirectionEnum.Neutral,
      confidence: EXTRA_CONFIDENCE.equalHighs,
      price: current.close,
      meta: { level: range.high },
    }];
  }
}
