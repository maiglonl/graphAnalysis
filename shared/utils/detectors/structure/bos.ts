import { PatternIdEnum } from '#shared/types/market';
import { StructureBreakDetector } from './StructureBreakDetector';
import { CONFIDENCE } from '../constants';

export class BosDetector extends StructureBreakDetector {
  protected override readonly bullishId = PatternIdEnum.BullishBos;
  protected override readonly bearishId = PatternIdEnum.BearishBos;
  protected override readonly confidence = CONFIDENCE.bos;
  // Sem pré-condição de trend — BOS ocorre em qualquer contexto.
}
