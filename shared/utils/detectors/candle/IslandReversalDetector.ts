import type { Candle } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import type { MatchResult } from '../CandlePatternDetector';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { calculateTargets } from '../helpers';

export abstract class IslandReversalDetector extends CandlePatternDetector {
  protected abstract readonly bullishReversal: boolean;

  protected override match(candles: Candle[], index: number, _ctx: ScanContext): MatchResult | null {
    if (index < 2) return null;
    const first = candles[index - 2];
    const middle = candles[index - 1];
    const current = candles[index];
    if (!first || !middle || !current) return null;

    const minGap = first.close * EXTRA_THRESHOLDS.gapMinPct;
    const gapIntoIsland = this.bullishReversal
      ? first.low - middle.high >= minGap
      : middle.low - first.high >= minGap;
    const gapOutOfIsland = this.bullishReversal
      ? current.low - middle.high >= minGap
      : middle.low - current.high >= minGap;

    if (!gapIntoIsland || !gapOutOfIsland) return null;

    const low = Math.min(first.low, middle.low, current.low);
    const high = Math.max(first.high, middle.high, current.high);
    const risk = high - low;
    const entry = this.bullishReversal ? current.high : current.low;

    return {
      price: current.close,
      entry,
      stop: this.bullishReversal ? low : high,
      targets: calculateTargets(entry, risk, this.bullishReversal ? 'up' : 'down'),
    };
  }
}
