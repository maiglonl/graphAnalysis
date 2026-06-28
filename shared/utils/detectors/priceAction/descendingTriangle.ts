import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import type { TriangleHalves } from './TrianglePatternDetector';
import { TrianglePatternDetector } from './TrianglePatternDetector';

export class DescendingTriangleDetector extends TrianglePatternDetector {
  protected override readonly id = PatternIdEnum.DescendingTriangle;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.descendingTriangle;

  protected override matchesShape(h: TriangleHalves): boolean {
    const lowBase = h.firstAvgLow || 1;
    const highBase = h.firstAvgHigh || 1;
    const lowsDiff = Math.abs(h.secondAvgLow - h.firstAvgLow) / lowBase;
    const highsDiff = (h.firstAvgHigh - h.secondAvgHigh) / highBase;
    return (
      lowsDiff <= EXTRA_THRESHOLDS.triangleFlatSideTolerancePct &&
      highsDiff >= EXTRA_THRESHOLDS.triangleSlopeMinPct
    );
  }

  protected override getBreakoutDirection(
    current: Candle,
    h: TriangleHalves,
    breakThreshold: number,
  ): PatternDirectionEnum | null {
    return current.close < h.rangeLow - breakThreshold ? PatternDirectionEnum.Bearish : null;
  }
}
