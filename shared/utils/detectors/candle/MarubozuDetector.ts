import type { Candle } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import type { MatchResult } from '../CandlePatternDetector';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { calculateTargets, candleParts } from '../helpers';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';

export abstract class MarubozuDetector extends CandlePatternDetector {
  protected abstract readonly bullishBody: boolean;

  protected override match(candles: Candle[], index: number, _ctx: ScanContext): MatchResult | null {
    const candle = candles[index];
    if (!candle) return null;

    const parts = candleParts(candle);
    if (parts.range <= 0) return null;
    if (this.bullishBody ? !parts.isBullish : !parts.isBearish) return null;
    if (parts.bodyPct < EXTRA_THRESHOLDS.marubozuMinBodyPct) return null;
    if (parts.upperShadow / parts.range > EXTRA_THRESHOLDS.marubozuMaxShadowPct) return null;
    if (parts.lowerShadow / parts.range > EXTRA_THRESHOLDS.marubozuMaxShadowPct) return null;

    const risk = candle.high - candle.low;
    const entry = this.bullishBody ? candle.high : candle.low;

    return {
      price: candle.close,
      entry,
      stop: this.bullishBody ? candle.low : candle.high,
      targets: calculateTargets(entry, risk, this.bullishBody ? 'up' : 'down'),
    };
  }
}
