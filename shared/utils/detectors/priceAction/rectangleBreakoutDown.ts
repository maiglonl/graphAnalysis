import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { RangePatternDetector } from './RangePatternDetector';

export class RectangleBreakoutDownDetector extends RangePatternDetector {
  protected override readonly id = PatternIdEnum.RectangleBreakoutDown;
  protected override readonly direction = PatternDirectionEnum.Bearish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.rectangleBreakoutDown;
  protected override readonly signalType = 'breakout' as const;
}
