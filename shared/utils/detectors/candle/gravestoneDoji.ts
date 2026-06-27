import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { THRESHOLDS } from '../constants';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { candleParts } from '../helpers';

export class GravestoneDojiDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.GravestoneDoji;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.gravestoneDoji;

  protected override match(candles: Candle[], index: number, _ctx: ScanContext) {
    const candle = candles[index];
    if (!candle) return null;

    const parts = candleParts(candle);
    if (parts.range <= 0 || parts.bodyPct > THRESHOLDS.dojiMaxBodyPct) return null;
    if (parts.lowerShadow / parts.range > EXTRA_THRESHOLDS.gravestoneLowerShadowMaxPct) return null;

    return { price: candle.close, entry: candle.low, stop: candle.high };
  }
}
