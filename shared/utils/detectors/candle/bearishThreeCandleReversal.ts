import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { calculateTargets, candleParts } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';

export class BearishThreeCandleReversalDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.EveningStar;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.eveningStar;

  protected override match(candles: Candle[], index: number, ctx: ScanContext) {
    if (index < 2) return null;
    const first = candles[index - 2];
    const middle = candles[index - 1];
    const current = candles[index];
    if (!first || !middle || !current) return null;
    if (ctx.trend() !== StructureTrendEnum.Bullish) return null;

    const firstParts = candleParts(first);
    const middleParts = candleParts(middle);
    const currentParts = candleParts(current);
    const midpoint = first.open + (first.close - first.open) * EXTRA_THRESHOLDS.midpointFactor;

    if (!firstParts.isBullish || !currentParts.isBearish) return null;
    if (middleParts.bodyPct > EXTRA_THRESHOLDS.starMaxBodyPct) return null;
    if (current.close >= midpoint) return null;

    const low = Math.min(first.low, middle.low, current.low);
    const high = Math.max(first.high, middle.high, current.high);
    const risk = high - low;

    return {
      price: current.close,
      entry: low,
      stop: high,
      targets: calculateTargets(low, risk, 'down'),
    };
  }
}
