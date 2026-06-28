import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { RANGE_PATTERN_CONFIDENCE } from './rangePatternConstants';
import { RangePatternDetector } from './RangePatternDetector';

export class RectangleBreakoutUpDetector extends RangePatternDetector {
  protected override readonly id = PatternIdEnum.RectangleBreakoutUp;
  protected override readonly direction = PatternDirectionEnum.Bullish;
  protected override readonly baseConfidence = RANGE_PATTERN_CONFIDENCE.rectangleBreakoutUp;
  protected override readonly signalType = 'breakout' as const;
}
