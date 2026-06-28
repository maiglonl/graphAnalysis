import type { Candle } from '#shared/types/market';
import { StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import type { MatchResult } from '../CandlePatternDetector';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { calculateTargets, candleParts } from '../helpers';

export abstract class TasukiGapDetector extends CandlePatternDetector {
  protected abstract readonly bullishContinuation: boolean;
  protected abstract readonly requiredTrend: StructureTrendEnum;

  protected override match(candles: Candle[], index: number, ctx: ScanContext): MatchResult | null {
    if (index < 2) return null;
    const first = candles[index - 2];
    const second = candles[index - 1];
    const current = candles[index];
    if (!first || !second || !current) return null;
    if (ctx.trend() !== this.requiredTrend) return null;

    const firstParts = candleParts(first);
    const secondParts = candleParts(second);
    const currentParts = candleParts(current);
    const minGap = first.close * EXTRA_THRESHOLDS.gapMinPct;

    const validGap = this.bullishContinuation
      ? second.low - first.high >= minGap
      : first.low - second.high >= minGap;
    const validDirections = this.bullishContinuation
      ? firstParts.isBullish && secondParts.isBullish && currentParts.isBearish
      : firstParts.isBearish && secondParts.isBearish && currentParts.isBullish;
    const currentClosesIntoGap = this.bullishContinuation
      ? current.close > first.high && current.close < second.low
      : current.close < first.low && current.close > second.high;

    if (!validGap || !validDirections || !currentClosesIntoGap) return null;

    const low = Math.min(first.low, second.low, current.low);
    const high = Math.max(first.high, second.high, current.high);
    const risk = high - low;
    const entry = this.bullishContinuation ? second.high : second.low;

    return {
      price: current.close,
      entry,
      stop: this.bullishContinuation ? low : high,
      targets: calculateTargets(entry, risk, this.bullishContinuation ? 'up' : 'down'),
    };
  }
}
