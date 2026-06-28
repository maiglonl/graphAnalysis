import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { WedgePatternDetector } from './WedgePatternDetector';

export class FallingWedgeDetector extends WedgePatternDetector {
  protected override readonly id = PatternIdEnum.FallingWedge;
  protected override readonly direction = PatternDirectionEnum.Bullish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.fallingWedge;

  protected override matchesShape(fH: number, fL: number, sH: number, sL: number): boolean {
    const base = fH || 1;
    const lowBase = fL || 1;
    const slopeMin = EXTRA_THRESHOLDS.wedgeSlopeMinPct;
    const highsFall = (fH - sH) / base >= slopeMin;
    const lowsFall = (fL - sL) / lowBase >= slopeMin;
    const firstSpread = fH - fL;
    const secondSpread = sH - sL;
    const converging = firstSpread > 0 && secondSpread < firstSpread;
    return highsFall && lowsFall && converging;
  }
}
