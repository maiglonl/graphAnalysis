import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { LowVolumePullbackDetector } from './LowVolumePullbackDetector';

export class LowVolumePullbackBearishDetector extends LowVolumePullbackDetector {
  protected override readonly id = PatternIdEnum.LowVolumePullbackBearish;
  protected override readonly direction = PatternDirectionEnum.Bearish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.lowVolumePullbackBearish;
}
