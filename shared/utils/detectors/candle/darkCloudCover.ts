import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import type { Candle } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import type { MatchResult } from '../CandlePatternDetector';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { calculateTargets, candleParts } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';

export class DarkCloudCoverDetector extends CandlePatternDetector {
  readonly id = PatternIdEnum.DarkCloudCover;
  readonly direction = PatternDirectionEnum.Bearish;
  readonly baseConfidence = EXTRA_CONFIDENCE.darkCloudCover;

  protected override match(candles: Candle[], index: number, ctx: ScanContext): MatchResult | null {
    if (index < 1) return null;
    const prev = candles[index - 1];
    const curr = candles[index];
    if (!prev || !curr) return null;
    if (ctx.trend() !== StructureTrendEnum.Bullish) return null;

    const prevParts = candleParts(prev);
    const currParts = candleParts(curr);
    if (!prevParts.isBullish || !currParts.isBearish) return null;

    const prevBodyHigh = Math.max(prev.open, prev.close);
    const prevBodySize = Math.abs(prev.open - prev.close);
    if (prevBodySize === 0) return null;

    const tolerance = prevBodySize * EXTRA_THRESHOLDS.onNeckTolerancePct;
    const midpoint = prevBodyHigh - prevBodySize * EXTRA_THRESHOLDS.midpointFactor;

    if (curr.open < prevBodyHigh - tolerance) return null;
    if (curr.close >= midpoint) return null;

    const low = Math.min(prev.low, curr.low);
    const high = Math.max(prev.high, curr.high);
    const risk = high - low;

    return {
      price: curr.close,
      entry: low,
      stop: high,
      targets: calculateTargets(low, risk, 'down'),
    };
  }
}
