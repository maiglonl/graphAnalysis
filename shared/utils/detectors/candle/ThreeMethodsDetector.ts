import type { Candle } from '#shared/types/market';
import { StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import type { MatchResult } from '../CandlePatternDetector';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { calculateTargets, candleParts } from '../helpers';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';

export abstract class ThreeMethodsDetector extends CandlePatternDetector {
  protected abstract readonly bullishContinuation: boolean;
  protected abstract readonly requiredTrend: StructureTrendEnum;

  protected override match(candles: Candle[], index: number, ctx: ScanContext): MatchResult | null {
    if (index < 4) return null;
    const sequence = candles.slice(index - 4, index + 1);
    if (sequence.length < 5) return null;
    if (ctx.trend() !== this.requiredTrend) return null;

    const [first, second, third, fourth, last] = sequence as [Candle, Candle, Candle, Candle, Candle];
    const firstParts = candleParts(first);
    const middleParts = [second, third, fourth].map((candle) => candleParts(candle));
    const lastParts = candleParts(last);

    const firstDirectionOk = this.bullishContinuation ? firstParts.isBullish : firstParts.isBearish;
    const lastDirectionOk = this.bullishContinuation ? lastParts.isBullish : lastParts.isBearish;
    const middleInsideRange = [second, third, fourth].every((candle) => candle.high <= first.high && candle.low >= first.low);
    const middleSmallBodies = middleParts.every((part) => part.bodyPct <= EXTRA_THRESHOLDS.continuationPullbackMaxBodyPct);
    const continuationCloseOk = this.bullishContinuation ? last.close > first.close : last.close < first.close;

    if (!firstDirectionOk || !lastDirectionOk || !middleInsideRange || !middleSmallBodies || !continuationCloseOk) {
      return null;
    }

    const low = Math.min(...sequence.map((candle) => candle.low));
    const high = Math.max(...sequence.map((candle) => candle.high));
    const risk = high - low;
    const entry = this.bullishContinuation ? high : low;

    return {
      price: last.close,
      entry,
      stop: this.bullishContinuation ? low : high,
      targets: calculateTargets(entry, risk, this.bullishContinuation ? 'up' : 'down'),
    };
  }
}
