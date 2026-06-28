import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { LowVolumePullbackDetector } from './LowVolumePullbackDetector';

export class LowVolumePullbackBullishDetector extends LowVolumePullbackDetector {
  protected override readonly id = PatternIdEnum.LowVolumePullbackBullish;
  protected override readonly direction = PatternDirectionEnum.Bullish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.lowVolumePullbackBullish;
}
