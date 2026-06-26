import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { EngulfingDetector } from './EngulfingDetector';
import { CONFIDENCE } from '../constants';

export class BullishEngulfingDetector extends EngulfingDetector {
  override readonly id = PatternIdEnum.BullishEngulfing;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = CONFIDENCE.bullishEngulfing;
  protected override readonly requiredTrend = StructureTrendEnum.Bearish;
  protected override readonly prevIsBullish = false;
}
