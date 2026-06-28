import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';

export class AtrCompressionDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current || ctx.index < 1 || ctx.currentAtr <= 0) return [];

    const previousAtr = ctx.atr14[ctx.index - 1] ?? 0;
    if (previousAtr <= 0 || ctx.currentAtr / previousAtr > EXTRA_THRESHOLDS.atrCompressionRatioMax) return [];

    return [{
      id: PatternIdEnum.AtrCompression,
      direction: PatternDirectionEnum.Neutral,
      confidence: EXTRA_CONFIDENCE.atrCompression,
      price: current.close,
      meta: { atr: ctx.currentAtr, previousAtr },
    }];
  }
}
