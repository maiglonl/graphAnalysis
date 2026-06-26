import type { PatternSignal } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import { getMarketStructure } from '#shared/utils/marketStructure';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../base';
import { round } from '../helpers';

export class ChochDetector extends PatternDetector {
  override detect(ctx: ScanContext): PatternSignal[] {
    const { candles, index, atr14 } = ctx;
    const current = candles[index];
    if (!current) return [];

    const atrValue = atr14[index] ?? 0;
    const buffer = atrValue * 0.05;
    const structure = getMarketStructure(candles, index, atrValue);

    if (structure.trend === StructureTrendEnum.Bearish && structure.lastHigh && current.close > structure.lastHigh.price + buffer) {
      return [
        {
          id: PatternIdEnum.BullishChoch,
          direction: PatternDirectionEnum.Bullish,
          confidence: 72,
          price: current.close,
          entry: current.close,
          stop: structure.lastLow?.price,
          targets: structure.lastLow
            ? [
                round(current.close + (current.close - structure.lastLow.price) * 2),
                round(current.close + (current.close - structure.lastLow.price) * 3),
              ]
            : undefined,
          meta: { brokenLevel: structure.lastHigh.price, structure },
        },
      ];
    }

    if (structure.trend === StructureTrendEnum.Bullish && structure.lastLow && current.close < structure.lastLow.price - buffer) {
      return [
        {
          id: PatternIdEnum.BearishChoch,
          direction: PatternDirectionEnum.Bearish,
          confidence: 72,
          price: current.close,
          entry: current.close,
          stop: structure.lastHigh?.price,
          targets: structure.lastHigh
            ? [
                round(current.close - (structure.lastHigh.price - current.close) * 2),
                round(current.close - (structure.lastHigh.price - current.close) * 3),
              ]
            : undefined,
          meta: { brokenLevel: structure.lastLow.price, structure },
        },
      ];
    }

    return [];
  }
}
