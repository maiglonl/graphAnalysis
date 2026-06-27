import type { Candle } from '#shared/types/market';
import { StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import type { MatchResult } from '../CandlePatternDetector';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';

export abstract class GapDetector extends CandlePatternDetector {
  protected abstract readonly bullishGap: boolean;
  protected abstract readonly requiredTrend: StructureTrendEnum;

  protected override match(candles: Candle[], index: number, ctx: ScanContext): MatchResult | null {
    if (index < 1) return null;
    const previous = candles[index - 1];
    const current = candles[index];
    if (!previous || !current) return null;
    if (ctx.trend() !== this.requiredTrend) return null;

    const minGap = previous.close * EXTRA_THRESHOLDS.gapMinPct;
    const gapIsValid = this.bullishGap
      ? current.low - previous.high >= minGap
      : previous.low - current.high >= minGap;

    if (!gapIsValid) return null;

    const low = Math.min(previous.low, current.low);
    const high = Math.max(previous.high, current.high);
    const risk = high - low;
    const entry = this.bullishGap ? current.high : current.low;

    return {
      price: current.close,
      entry,
      stop: this.bullishGap ? previous.high : previous.low,
      targets: calculateTargets(entry, risk, this.bullishGap ? 'up' : 'down'),
    };
  }
}
