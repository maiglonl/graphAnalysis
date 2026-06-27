import type { Candle } from '#shared/types/market';
import { StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import type { MatchResult } from '../CandlePatternDetector';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { calculateTargets, candleParts } from '../helpers';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';

export abstract class ThreeCandleSequenceDetector extends CandlePatternDetector {
  protected abstract readonly bullishSequence: boolean;
  protected abstract readonly requiredTrend: StructureTrendEnum;

  protected override match(candles: Candle[], index: number, ctx: ScanContext): MatchResult | null {
    if (index < 2) return null;
    const sequence = [candles[index - 2], candles[index - 1], candles[index]];
    if (sequence.some((candle) => !candle)) return null;
    if (ctx.trend() !== this.requiredTrend) return null;

    const typedSequence = sequence as [Candle, Candle, Candle];
    const parts = typedSequence.map((candle) => candleParts(candle));
    const hasValidBodies = parts.every((part) => part.bodyPct >= EXTRA_THRESHOLDS.threeCandleSequenceMinBodyPct);
    const hasValidDirection = parts.every((part) => this.bullishSequence ? part.isBullish : part.isBearish);
    const hasProgression = this.bullishSequence
      ? typedSequence[0].close < typedSequence[1].close && typedSequence[1].close < typedSequence[2].close
      : typedSequence[0].close > typedSequence[1].close && typedSequence[1].close > typedSequence[2].close;

    if (!hasValidBodies || !hasValidDirection || !hasProgression) return null;

    const low = Math.min(...typedSequence.map((candle) => candle.low));
    const high = Math.max(...typedSequence.map((candle) => candle.high));
    const risk = high - low;
    const entry = this.bullishSequence ? high : low;

    return {
      price: typedSequence[2].close,
      entry,
      stop: this.bullishSequence ? low : high,
      targets: calculateTargets(entry, risk, this.bullishSequence ? 'up' : 'down'),
    };
  }
}
