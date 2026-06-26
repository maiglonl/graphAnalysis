import type { Candle } from '#shared/types/market';
import { StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import type { MatchResult } from '../CandlePatternDetector';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { candleParts, calculateTargets } from '../helpers';
import { THRESHOLDS } from '../constants';

export abstract class EngulfingDetector extends CandlePatternDetector {
  protected abstract readonly requiredTrend: StructureTrendEnum;
  protected abstract readonly prevIsBullish: boolean;

  protected override match(candles: Candle[], index: number, ctx: ScanContext): MatchResult | null {
    if (index < 1) return null;
    const previous = candles[index - 1];
    const current = candles[index];
    if (!previous || !current) return null;

    const prev = candleParts(previous);
    const curr = candleParts(current);

    if (ctx.trend() !== this.requiredTrend) return null;
    if (this.prevIsBullish ? !prev.isBullish : !prev.isBearish) return null;
    if (this.prevIsBullish ? !curr.isBearish : !curr.isBullish) return null;

    const prevCloseGapSatisfied = this.prevIsBullish
      ? current.open >= previous.close && current.close <= previous.open
      : current.open <= previous.close && current.close >= previous.open;

    if (!prevCloseGapSatisfied) return null;
    if (curr.body < prev.body * THRESHOLDS.engulfingBodyGrowthFactor) return null;
    if (curr.bodyPct < THRESHOLDS.engulfingMinBodyPct) return null;

    const low = Math.min(previous.low, current.low);
    const high = Math.max(previous.high, current.high);
    const risk = high - low;
    const isBullish = !this.prevIsBullish;

    return {
      price: current.close,
      entry: isBullish ? high : low,
      stop: isBullish ? low : high,
      targets: calculateTargets(isBullish ? high : low, risk, isBullish ? 'up' : 'down'),
    };
  }
}
