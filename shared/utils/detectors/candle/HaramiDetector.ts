import type { Candle } from '#shared/types/market';
import { StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import type { MatchResult } from '../CandlePatternDetector';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { calculateTargets, candleParts } from '../helpers';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';

export abstract class HaramiDetector extends CandlePatternDetector {
  protected abstract readonly requiredTrend: StructureTrendEnum;
  protected abstract readonly previousBullish: boolean;

  protected override match(candles: Candle[], index: number, ctx: ScanContext): MatchResult | null {
    if (index < 1) return null;
    const previous = candles[index - 1];
    const current = candles[index];
    if (!previous || !current) return null;
    if (ctx.trend() !== this.requiredTrend) return null;

    const prev = candleParts(previous);
    const curr = candleParts(current);

    if (this.previousBullish ? !prev.isBullish : !prev.isBearish) return null;
    if (this.previousBullish ? !curr.isBearish : !curr.isBullish) return null;
    if (curr.body > prev.body * EXTRA_THRESHOLDS.haramiMaxBodyFactor) return null;

    const currentBodyHigh = Math.max(current.open, current.close);
    const currentBodyLow = Math.min(current.open, current.close);
    const previousBodyHigh = Math.max(previous.open, previous.close);
    const previousBodyLow = Math.min(previous.open, previous.close);

    if (currentBodyHigh > previousBodyHigh || currentBodyLow < previousBodyLow) return null;

    const low = Math.min(previous.low, current.low);
    const high = Math.max(previous.high, current.high);
    const risk = high - low;
    const isBullish = !this.previousBullish;

    return {
      price: current.close,
      entry: isBullish ? high : low,
      stop: isBullish ? low : high,
      targets: calculateTargets(isBullish ? high : low, risk, isBullish ? 'up' : 'down'),
    };
  }
}
