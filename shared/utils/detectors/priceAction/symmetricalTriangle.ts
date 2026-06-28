import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import type { TriangleHalves } from './TrianglePatternDetector';
import { TrianglePatternDetector } from './TrianglePatternDetector';

export class SymmetricalTriangleDetector extends TrianglePatternDetector {
  protected override readonly id = PatternIdEnum.SymmetricalTriangle;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.symmetricalTriangle;

  protected override matchesShape(h: TriangleHalves): boolean {
    const highBase = h.firstAvgHigh || 1;
    const lowBase = h.firstAvgLow || 1;
    const highsDescending = (h.firstAvgHigh - h.secondAvgHigh) / highBase >= EXTRA_THRESHOLDS.triangleSlopeMinPct;
    const lowsAscending = (h.secondAvgLow - h.firstAvgLow) / lowBase >= EXTRA_THRESHOLDS.triangleSlopeMinPct;
    return highsDescending && lowsAscending;
  }

  protected override getBreakoutDirection(
    current: Candle,
    h: TriangleHalves,
    breakThreshold: number,
  ): PatternDirectionEnum | null {
    if (current.close > h.rangeHigh + breakThreshold) return PatternDirectionEnum.Bullish;
    if (current.close < h.rangeLow - breakThreshold) return PatternDirectionEnum.Bearish;
    return null;
  }
}
