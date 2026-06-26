import type { Candle, PatternSignal } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from './PatternDetector';

export type MatchResult = {
  price?: number;
  entry?: number;
  stop?: number;
  targets?: number[];
  meta?: Record<string, unknown>;
};

/**
 * Base para padrões que examinam uma janela fixa de candles e produzem
 * exatamente um sinal de direção e confiança conhecidos de antemão.
 * Subclasses implementam apenas a lógica de detecção em match().
 */
export abstract class CandlePatternDetector extends PatternDetector {
  abstract readonly id: PatternIdEnum;
  abstract readonly direction: PatternDirectionEnum;
  abstract readonly baseConfidence: number;

  protected abstract match(candles: Candle[], index: number, ctx: ScanContext): MatchResult | null;

  override detect(ctx: ScanContext): PatternSignal[] {
    const result = this.match(ctx.candles, ctx.index, ctx);
    if (!result) return [];
    return [{ id: this.id, direction: this.direction, confidence: this.baseConfidence, ...result }];
  }
}
