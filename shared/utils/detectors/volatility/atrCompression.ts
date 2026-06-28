import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternSignal } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';

export class AtrCompressionDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current || ctx.index < 14 || ctx.currentAtr <= 0) return [];

    const referenceAtr = ctx.atr14[ctx.index - 14] ?? 0;
    if (referenceAtr <= 0 || ctx.currentAtr / referenceAtr > EXTRA_THRESHOLDS.atrCompressionRatioMax) return [];

    return [{
      id: PatternIdEnum.AtrCompression,
      direction: PatternDirectionEnum.Neutral,
      confidence: EXTRA_CONFIDENCE.atrCompression,
      price: current.close,
      meta: { atr: ctx.currentAtr, referenceAtr },
    }];
  }
}
