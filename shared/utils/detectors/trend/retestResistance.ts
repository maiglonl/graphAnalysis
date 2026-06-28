import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { getSwingHighs } from '#shared/utils/marketStructure';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { TrendPatternDetector } from './TrendPatternDetector';

export class RetestResistanceDetector extends TrendPatternDetector {
  protected override readonly id = PatternIdEnum.RetestResistance;
  protected override readonly direction = PatternDirectionEnum.Bearish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.retestResistance;

  protected override matches(ctx: ScanContext): boolean {
    const current = ctx.currentCandle;
    if (!current || ctx.index < 4) return false;
    const swingHighs = getSwingHighs(ctx.candles, ctx.index, 1);
    if (swingHighs.length === 0) return false;
    const resistance = swingHighs[0]!.price;
    const tolerance = resistance * EXTRA_THRESHOLDS.retestTolerancePct;
    return current.high >= resistance - tolerance && current.close < current.open;
  }
}
