import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { candleParts } from '../helpers';
import { CONFIDENCE, THRESHOLDS } from '../constants';

export class DojiDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.Doji;
  override readonly direction = PatternDirectionEnum.Neutral;
  override readonly baseConfidence = CONFIDENCE.doji;

  protected override match(candles: Candle[], index: number, _ctx: ScanContext) {
    const candle = candles[index];
    if (!candle) return null;
    const parts = candleParts(candle);
    if (parts.range <= 0 || parts.bodyPct > THRESHOLDS.dojiMaxBodyPct) return null;
    return { price: candle.close };
  }
}
