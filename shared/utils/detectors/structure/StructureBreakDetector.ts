import type { MarketStructure, PatternSignal } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { getMarketStructure } from '#shared/utils/marketStructure';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { ATR } from '../constants';

export abstract class StructureBreakDetector extends PatternDetector {
  protected abstract readonly bullishId: PatternIdEnum;
  protected abstract readonly bearishId: PatternIdEnum;
  protected abstract readonly confidence: number;

  /** Retorna true se as condições de contexto permitem a detecção (ex: trend oposto para CHOCH). */
  protected allowsBullish(_structure: MarketStructure): boolean { return true; }
  protected allowsBearish(_structure: MarketStructure): boolean { return true; }

  override detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current) return [];

    const atrTolerance = ctx.currentAtr * ATR.breakoutTolerance;
    const structure = getMarketStructure(ctx.candles, ctx.index, ctx.currentAtr);

    if (
      this.allowsBullish(structure) &&
      structure.lastHigh &&
      current.close > structure.lastHigh.price + atrTolerance
    ) {
      const risk = structure.lastLow
        ? current.close - structure.lastLow.price
        : ctx.currentAtr;

      return [
        {
          id: this.bullishId,
          direction: PatternDirectionEnum.Bullish,
          confidence: this.confidence,
          price: current.close,
          entry: current.close,
          stop: structure.lastLow?.price,
          targets: calculateTargets(current.close, risk, 'up'),
          meta: { brokenLevel: structure.lastHigh.price, structure },
        },
      ];
    }

    if (
      this.allowsBearish(structure) &&
      structure.lastLow &&
      current.close < structure.lastLow.price - atrTolerance
    ) {
      const risk = structure.lastHigh
        ? structure.lastHigh.price - current.close
        : ctx.currentAtr;

      return [
        {
          id: this.bearishId,
          direction: PatternDirectionEnum.Bearish,
          confidence: this.confidence,
          price: current.close,
          entry: current.close,
          stop: structure.lastHigh?.price,
          targets: calculateTargets(current.close, risk, 'down'),
          meta: { brokenLevel: structure.lastLow.price, structure },
        },
      ];
    }

    return [];
  }
}
