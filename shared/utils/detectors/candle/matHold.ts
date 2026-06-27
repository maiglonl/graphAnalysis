import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { calculateTargets, candleParts } from '../helpers';

export class MatHoldDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.MatHold;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.matHold;

  protected override match(candles: Candle[], index: number, ctx: ScanContext) {
    if (index < 4) return null;
    const sequence = candles.slice(index - 4, index + 1) as [Candle, Candle, Candle, Candle, Candle];
    if (sequence.length < 5 || ctx.trend() !== StructureTrendEnum.Bullish) return null;

    const [first, second, third, fourth, last] = sequence;
    const firstParts = candleParts(first);
    const middle = [second, third, fourth];
    const middleSmallBodies = middle.every((candle) => candleParts(candle).bodyPct <= EXTRA_THRESHOLDS.continuationPullbackMaxBodyPct);
    const middleAboveFirstLow = middle.every((candle) => candle.low > first.low);
    const lastParts = candleParts(last);

    if (!firstParts.isBullish || !lastParts.isBullish || !middleSmallBodies || !middleAboveFirstLow) return null;
    if (second.low <= first.high) return null;
    if (last.close <= Math.max(first.close, second.close, third.close, fourth.close)) return null;

    const low = Math.min(...sequence.map((candle) => candle.low));
    const high = Math.max(...sequence.map((candle) => candle.high));
    const risk = high - low;

    return {
      price: last.close,
      entry: high,
      stop: low,
      targets: calculateTargets(high, risk, 'up'),
    };
  }
}
