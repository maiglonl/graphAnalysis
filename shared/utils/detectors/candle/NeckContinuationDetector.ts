import type { Candle } from '#shared/types/market';
import { StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import type { MatchResult } from '../CandlePatternDetector';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { calculateTargets, candleParts } from '../helpers';

export enum NeckCloseMode {
  NearPreviousClose = 'nearPreviousClose',
  SlightlyAbovePreviousClose = 'slightlyAbovePreviousClose',
  IntoPreviousBody = 'intoPreviousBody',
}

export abstract class NeckContinuationDetector extends CandlePatternDetector {
  protected abstract readonly closeMode: NeckCloseMode;

  protected override match(candles: Candle[], index: number, ctx: ScanContext): MatchResult | null {
    if (index < 1) return null;
    const previous = candles[index - 1];
    const current = candles[index];
    if (!previous || !current) return null;
    if (ctx.trend() !== StructureTrendEnum.Bearish) return null;

    const prev = candleParts(previous);
    const curr = candleParts(current);
    if (!prev.isBearish || !curr.isBullish) return null;

    const tolerance = previous.close * EXTRA_THRESHOLDS.neckLineTolerancePct;
    const midpoint = previous.close + (previous.open - previous.close) * EXTRA_THRESHOLDS.midpointFactor;
    const closeOk = this.matchesCloseMode(current.close, previous.close, midpoint, tolerance);
    if (!closeOk) return null;

    const low = Math.min(previous.low, current.low);
    const high = Math.max(previous.high, current.high);
    const risk = high - low;

    return {
      price: current.close,
      entry: low,
      stop: high,
      targets: calculateTargets(low, risk, 'down'),
    };
  }

  private matchesCloseMode(close: number, previousClose: number, midpoint: number, tolerance: number): boolean {
    if (this.closeMode === NeckCloseMode.NearPreviousClose) {
      return Math.abs(close - previousClose) <= tolerance;
    }

    if (this.closeMode === NeckCloseMode.SlightlyAbovePreviousClose) {
      return close > previousClose + tolerance && close < midpoint;
    }

    return close >= midpoint;
  }
}
