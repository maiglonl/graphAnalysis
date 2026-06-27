import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum, StructureTrendEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { calculateTargets, candleParts } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';

export class TweezerTopDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.TweezerTop;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.tweezerTop;

  protected override match(candles: Candle[], index: number, ctx: ScanContext) {
    if (index < 1) return null;
    const previous = candles[index - 1];
    const current = candles[index];
    if (!previous || !current) return null;
    if (ctx.trend() !== StructureTrendEnum.Bullish) return null;

    const prev = candleParts(previous);
    const curr = candleParts(current);
    if (!prev.isBullish || !curr.isBearish) return null;

    const tolerance = Math.max(previous.high, current.high) * EXTRA_THRESHOLDS.tweezerTolerancePct;
    if (Math.abs(previous.high - current.high) > tolerance) return null;

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
}
