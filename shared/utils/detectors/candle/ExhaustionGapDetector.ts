import type { Candle } from '#shared/types/market';
import { StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import type { MatchResult } from '../CandlePatternDetector';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { calculateTargets, candleParts } from '../helpers';

export abstract class ExhaustionGapDetector extends CandlePatternDetector {
  protected abstract readonly bullishGap: boolean;
  protected abstract readonly requiredTrend: StructureTrendEnum;

  protected override match(candles: Candle[], index: number, ctx: ScanContext): MatchResult | null {
    if (index < 1) return null;
    const previous = candles[index - 1];
    const current = candles[index];
    if (!previous || !current) return null;
    if (ctx.trend() !== this.requiredTrend) return null;

    const minGap = previous.close * EXTRA_THRESHOLDS.gapMinPct;
    const currentParts = candleParts(current);
    const validGap = this.bullishGap
      ? current.low - previous.high >= minGap
      : previous.low - current.high >= minGap;
    const rejection = this.bullishGap
      ? currentParts.isBearish || current.close < current.open + currentParts.body
      : currentParts.isBullish || current.close > current.open - currentParts.body;

    if (!validGap || !rejection) return null;

    const low = Math.min(previous.low, current.low);
    const high = Math.max(previous.high, current.high);
    const risk = high - low;
    const entry = this.bullishGap ? current.low : current.high;

    return {
      price: current.close,
      entry,
      stop: this.bullishGap ? high : low,
      targets: calculateTargets(entry, risk, this.bullishGap ? 'down' : 'up'),
    };
  }
}
