import type { Candle } from '#shared/types/market';
import { StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import type { MatchResult } from '../CandlePatternDetector';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { calculateTargets, candleParts } from '../helpers';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';

export abstract class SeparatingLinesDetector extends CandlePatternDetector {
  protected abstract readonly bullishContinuation: boolean;
  protected abstract readonly requiredTrend: StructureTrendEnum;

  protected override match(candles: Candle[], index: number, ctx: ScanContext): MatchResult | null {
    if (index < 1) return null;
    const previous = candles[index - 1];
    const current = candles[index];
    if (!previous || !current) return null;
    if (ctx.trend() !== this.requiredTrend) return null;

    const prev = candleParts(previous);
    const curr = candleParts(current);
    const directionOk = this.bullishContinuation
      ? prev.isBearish && curr.isBullish
      : prev.isBullish && curr.isBearish;
    const tolerance = previous.open * EXTRA_THRESHOLDS.separatingLinesOpenTolerancePct;

    if (!directionOk) return null;
    if (Math.abs(previous.open - current.open) > tolerance) return null;

    const low = Math.min(previous.low, current.low);
    const high = Math.max(previous.high, current.high);
    const risk = high - low;
    const entry = this.bullishContinuation ? high : low;

    return {
      price: current.close,
      entry,
      stop: this.bullishContinuation ? low : high,
      targets: calculateTargets(entry, risk, this.bullishContinuation ? 'up' : 'down'),
    };
  }
}
