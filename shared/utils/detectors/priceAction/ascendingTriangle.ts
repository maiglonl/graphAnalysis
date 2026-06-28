import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import type { TriangleHalves } from './TrianglePatternDetector';
import { TrianglePatternDetector } from './TrianglePatternDetector';

export class AscendingTriangleDetector extends TrianglePatternDetector {
  protected override readonly id = PatternIdEnum.AscendingTriangle;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.ascendingTriangle;

  protected override matchesShape(h: TriangleHalves): boolean {
    const base = h.firstAvgHigh || 1;
    const highsDiff = Math.abs(h.secondAvgHigh - h.firstAvgHigh) / base;
    const lowsDiff = h.firstAvgLow > 0 ? (h.secondAvgLow - h.firstAvgLow) / h.firstAvgLow : 0;
    return (
      highsDiff <= EXTRA_THRESHOLDS.triangleFlatSideTolerancePct &&
      lowsDiff >= EXTRA_THRESHOLDS.triangleSlopeMinPct
    );
  }

  protected override getBreakoutDirection(
    current: Candle,
    h: TriangleHalves,
    breakThreshold: number,
  ): PatternDirectionEnum | null {
    return current.close > h.rangeHigh + breakThreshold ? PatternDirectionEnum.Bullish : null;
  }
}
