import type { Candle, PatternSignal } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';

type MatchResult = {
  price?: number;
  entry?: number;
  stop?: number;
  targets?: number[];
  meta?: Record<string, unknown>;
};

export abstract class PatternDetector {
  abstract detect(ctx: ScanContext): PatternSignal[];
}

/**
 * Base for patterns that examine a fixed candle window and always produce
 * a single signal of a known direction and confidence.
 * Subclasses implement only the matching logic via `match`.
 */
export abstract class CandlePatternDetector extends PatternDetector {
  abstract readonly id: PatternIdEnum;
  abstract readonly direction: PatternDirectionEnum;
  abstract readonly baseConfidence: number;

  protected abstract match(candles: Candle[], index: number): MatchResult | null;

  override detect(ctx: ScanContext): PatternSignal[] {
    const result = this.match(ctx.candles, ctx.index);
    if (!result) return [];
    return [{ id: this.id, direction: this.direction, confidence: this.baseConfidence, ...result }];
  }
}
