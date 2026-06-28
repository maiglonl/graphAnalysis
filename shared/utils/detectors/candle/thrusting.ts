import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import type { Candle } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import type { MatchResult } from '../CandlePatternDetector';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { calculateTargets, candleParts } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';

export class ThrustingDetector extends CandlePatternDetector {
  readonly id = PatternIdEnum.Thrusting;
  readonly direction = PatternDirectionEnum.Bearish;
  readonly baseConfidence = EXTRA_CONFIDENCE.thrusting;

  protected override match(candles: Candle[], index: number, ctx: ScanContext): MatchResult | null {
    if (index < 1) return null;
    const prev = candles[index - 1];
    const curr = candles[index];
    if (!prev || !curr) return null;
    if (ctx.trend() !== StructureTrendEnum.Bearish) return null;

    const prevParts = candleParts(prev);
    const currParts = candleParts(curr);
    if (!prevParts.isBearish || !currParts.isBullish) return null;

    const prevBodyLow = Math.min(prev.open, prev.close);
    const prevBodySize = Math.abs(prev.open - prev.close);
    if (prevBodySize === 0) return null;

    const tolerance = prevBodySize * EXTRA_THRESHOLDS.onNeckTolerancePct;
    const minClose = prevBodyLow + prevBodySize * EXTRA_THRESHOLDS.inNeckMaxBodyPenetration;
    const midpoint = prevBodyLow + prevBodySize * EXTRA_THRESHOLDS.midpointFactor;

    if (curr.open > prevBodyLow + tolerance) return null;
    if (curr.close <= minClose) return null;
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
