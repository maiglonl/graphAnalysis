import type { PatternSignal } from '#shared/types/market';
import { MarketStructurePointEnum, PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { getMarketStructure } from '#shared/utils/marketStructure';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../base';

const POINT_TO_ID: Record<MarketStructurePointEnum, PatternIdEnum> = {
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
      id: POINT_TO_ID[point],
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
