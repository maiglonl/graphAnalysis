import type { Candle } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import type { MatchResult } from '../CandlePatternDetector';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';

export abstract class GapFillDetector extends CandlePatternDetector {
  protected abstract readonly bullishFill: boolean;

  protected override match(candles: Candle[], index: number, _ctx: ScanContext): MatchResult | null {
    if (index < 2) return null;
    const anchor = candles[index - 2];
    const gapCandle = candles[index - 1];
    const current = candles[index];
    if (!anchor || !gapCandle || !current) return null;

    const minGap = anchor.close * EXTRA_THRESHOLDS.gapMinPct;
    const gapDown = anchor.low - gapCandle.high >= minGap;
    const gapUp = gapCandle.low - anchor.high >= minGap;
    const fillOk = this.bullishFill
      ? gapDown && current.high >= anchor.low
      : gapUp && current.low <= anchor.high;

    if (!fillOk) return null;

    const low = Math.min(anchor.low, gapCandle.low, current.low);
    const high = Math.max(anchor.high, gapCandle.high, current.high);
    const risk = high - low;
    const entry = this.bullishFill ? current.close : current.close;

    return {
      price: current.close,
      entry,
      stop: this.bullishFill ? low : high,
      targets: calculateTargets(entry, risk, this.bullishFill ? 'up' : 'down'),
    };
  }
}
