import type { PatternSignal } from '#shared/types/market';
import {
  MarketStructurePointEnum,
  PatternDirectionEnum,
  PatternIdEnum,
  StructureTrendEnum,
} from '#shared/types/market';
import { getMarketStructure } from '#shared/utils/marketStructure';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from './base';

function round(value: number, decimals = 2) {
  return Number(value.toFixed(decimals));
}

const STRUCTURE_POINT_TO_PATTERN_ID: Record<MarketStructurePointEnum, PatternIdEnum> = {
  [MarketStructurePointEnum.HigherHigh]: PatternIdEnum.HigherHigh,
  [MarketStructurePointEnum.HigherLow]: PatternIdEnum.HigherLow,
  [MarketStructurePointEnum.LowerHigh]: PatternIdEnum.LowerHigh,
  [MarketStructurePointEnum.LowerLow]: PatternIdEnum.LowerLow,
};

export class MarketStructureDetector extends PatternDetector {
  override detect(ctx: ScanContext): PatternSignal[] {
    const { candles, index, atr14 } = ctx;
    const current = candles[index];
    if (!current) return [];

    const structure = getMarketStructure(candles, index, atr14[index] ?? 0);

    return structure.points.map((point) => ({
      id: STRUCTURE_POINT_TO_PATTERN_ID[point],
      direction:
        point === MarketStructurePointEnum.HigherHigh || point === MarketStructurePointEnum.HigherLow
          ? PatternDirectionEnum.Bullish
          : PatternDirectionEnum.Bearish,
      confidence: 58,
      price: current.close,
      meta: { structure },
    }));
  }
}

export class BosDetector extends PatternDetector {
  override detect(ctx: ScanContext): PatternSignal[] {
    const { candles, index, atr14 } = ctx;
    const current = candles[index];
    if (!current) return [];

    const atrValue = atr14[index] ?? 0;
    const buffer = atrValue * 0.05;
    const structure = getMarketStructure(candles, index, atrValue);

    if (structure.lastHigh && current.close > structure.lastHigh.price + buffer) {
      return [
        {
          id: PatternIdEnum.BullishBos,
          direction: PatternDirectionEnum.Bullish,
          confidence: 76,
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

    if (structure.lastLow && current.close < structure.lastLow.price - buffer) {
      return [
        {
          id: PatternIdEnum.BearishBos,
          direction: PatternDirectionEnum.Bearish,
          confidence: 76,
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
