import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { WedgePatternDetector } from './WedgePatternDetector';

export class RisingWedgeDetector extends WedgePatternDetector {
  protected override readonly id = PatternIdEnum.RisingWedge;
  protected override readonly direction = PatternDirectionEnum.Bearish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.risingWedge;

  protected override matchesShape(fH: number, fL: number, sH: number, sL: number): boolean {
    const base = fH || 1;
    const slopeMin = EXTRA_THRESHOLDS.wedgeSlopeMinPct;
    const highsRise = (sH - fH) / base >= slopeMin;
    const lowsRise = (sL - fL) / base >= slopeMin;
    const firstSpread = fH - fL;
    const secondSpread = sH - sL;
    const converging = firstSpread > 0 && secondSpread < firstSpread;
    return highsRise && lowsRise && converging;
  }
}
