import type { MarketStructure } from '#shared/types/market';
import { PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { StructureBreakDetector } from './StructureBreakDetector';
import { CONFIDENCE } from '../constants';

export class ChochDetector extends StructureBreakDetector {
  protected override readonly bullishId = PatternIdEnum.BullishChoch;
  protected override readonly bearishId = PatternIdEnum.BearishChoch;
  protected override readonly confidence = CONFIDENCE.choch;

  // CHOCH exige trend oposto — ruptura contrária à tendência vigente.
  protected override allowsBullish(structure: MarketStructure): boolean {
    return structure.trend === StructureTrendEnum.Bearish;
  }

  protected override allowsBearish(structure: MarketStructure): boolean {
    return structure.trend === StructureTrendEnum.Bullish;
  }
}
