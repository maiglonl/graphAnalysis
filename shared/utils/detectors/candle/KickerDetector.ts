import type { Candle } from '#shared/types/market';
import { StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import type { MatchResult } from '../CandlePatternDetector';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { calculateTargets, candleParts } from '../helpers';

export abstract class KickerDetector extends CandlePatternDetector {
  protected abstract readonly bullishBody: boolean;
  protected abstract readonly requiredTrend: StructureTrendEnum;

  protected override match(candles: Candle[], index: number, ctx: ScanContext): MatchResult | null {
    if (index < 1) return null;
    const previous = candles[index - 1];
    const current = candles[index];
    if (!previous || !current) return null;
    if (ctx.trend() !== this.requiredTrend) return null;

    const prev = candleParts(previous);
    const curr = candleParts(current);
    const validDirection = this.bullishBody
      ? prev.isBearish && curr.isBullish && current.open > previous.high
      : prev.isBullish && curr.isBearish && current.open < previous.low;

    if (!validDirection) return null;

    const low = Math.min(previous.low, current.low);
    const high = Math.max(previous.high, current.high);
    const risk = high - low;
    const entry = this.bullishBody ? current.high : current.low;

    return {
      price: current.close,
      entry,
      stop: this.bullishBody ? low : high,
      targets: calculateTargets(entry, risk, this.bullishBody ? 'up' : 'down'),
    };
  }
}
