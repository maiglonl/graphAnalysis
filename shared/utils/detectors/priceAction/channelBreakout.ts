import type { PatternSignal } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { PatternDetector } from '../PatternDetector';
import { calculateTargets } from '../helpers';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';

export class ChannelBreakoutDetector extends PatternDetector {
  detect(ctx: ScanContext): PatternSignal[] {
    const current = ctx.currentCandle;
    if (!current) return [];

    const lookback = EXTRA_THRESHOLDS.channelPatternLookback;
    if (ctx.index < lookback) return [];

    const candles = ctx.candles.slice(ctx.index - lookback, ctx.index);
    if (candles.length < lookback) return [];

    const mid = Math.floor(candles.length / 2);
    const first = candles.slice(0, mid);
    const second = candles.slice(mid);
    const avg = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const fH = avg(first.map((c) => c.high));
    const fL = avg(first.map((c) => c.low));
    const sH = avg(second.map((c) => c.high));
    const sL = avg(second.map((c) => c.low));

    const base = fH || 1;
    const slopeMin = EXTRA_THRESHOLDS.channelSlopeMinPct;

    const isUpChannel = (sH - fH) / base >= slopeMin && (sL - fL) / base >= slopeMin;
    const isDownChannel = (fH - sH) / base >= slopeMin && (fL - sL) / base >= slopeMin;

    if (!isUpChannel && !isDownChannel) return [];

    const rangeHigh = Math.max(...candles.map((c) => c.high));
    const rangeLow = Math.min(...candles.map((c) => c.low));
    const risk = rangeHigh - rangeLow;
    if (risk <= 0) return [];

    const breakThreshold = current.close * EXTRA_THRESHOLDS.swingPatternMinBreakPct;

    if (current.close > rangeHigh + breakThreshold) {
      const entry = current.close;
      const stop = rangeLow;
      return [{
        id: PatternIdEnum.ChannelBreakout,
        direction: PatternDirectionEnum.Bullish,
        confidence: EXTRA_CONFIDENCE.channelBreakout,
        price: current.close,
        entry,
        stop,
        targets: calculateTargets(entry, risk, 'up'),
        meta: { rangeHigh, rangeLow },
      }];
    }

    if (current.close < rangeLow - breakThreshold) {
      const entry = current.close;
      const stop = rangeHigh;
      return [{
        id: PatternIdEnum.ChannelBreakout,
        direction: PatternDirectionEnum.Bearish,
        confidence: EXTRA_CONFIDENCE.channelBreakout,
        price: current.close,
        entry,
        stop,
        targets: calculateTargets(entry, risk, 'down'),
        meta: { rangeHigh, rangeLow },
      }];
    }

    return [];
  }
}
