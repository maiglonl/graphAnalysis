import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { THRESHOLDS } from '../constants';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { candleParts } from '../helpers';

export class DragonflyDojiDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.DragonflyDoji;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = EXTRA_CONFIDENCE.dragonflyDoji;

  protected override match(candles: Candle[], index: number, _ctx: ScanContext) {
    const candle = candles[index];
    if (!candle) return null;

    const parts = candleParts(candle);
    if (parts.range <= 0 || parts.bodyPct > THRESHOLDS.dojiMaxBodyPct) return null;
    if (parts.upperShadow / parts.range > EXTRA_THRESHOLDS.dragonflyUpperShadowMaxPct) return null;

    return { price: candle.close, entry: candle.high, stop: candle.low };
  }
}
