import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EngulfingDetector } from './EngulfingDetector';
import { CONFIDENCE } from '../constants';

export class BearishEngulfingDetector extends EngulfingDetector {
  override readonly id = PatternIdEnum.BearishEngulfing;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = CONFIDENCE.bearishEngulfing;
  protected override readonly requiredTrend = StructureTrendEnum.Bullish;
  protected override readonly prevIsBullish = true;
}
