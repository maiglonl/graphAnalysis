import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { EXTRA_CONFIDENCE } from '../extraPatternConstants';
import { RangePatternDetector } from './RangePatternDetector';

export class RectangleBreakoutUpDetector extends RangePatternDetector {
  protected override readonly id = PatternIdEnum.RectangleBreakoutUp;
  protected override readonly direction = PatternDirectionEnum.Bullish;
  protected override readonly baseConfidence = EXTRA_CONFIDENCE.rectangleBreakoutUp;
  protected override readonly signalType = 'breakout' as const;
}
