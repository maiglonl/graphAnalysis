import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import type { ScanContext } from '#shared/utils/scanContext';
import { CandlePatternDetector } from '../CandlePatternDetector';
import { EXTRA_CONFIDENCE, EXTRA_THRESHOLDS } from '../extraPatternConstants';
import { candleParts } from '../helpers';

export class SpinningTopDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.SpinningTop;
  override readonly direction = PatternDirectionEnum.Neutral;
  override readonly baseConfidence = EXTRA_CONFIDENCE.spinningTop;

  protected override match(candles: Candle[], index: number, _ctx: ScanContext) {
    const candle = candles[index];
    if (!candle) return null;

    const parts = candleParts(candle);
    if (parts.range <= 0) return null;
    if (parts.bodyPct < EXTRA_THRESHOLDS.spinningTopMinBodyPct) return null;
    if (parts.bodyPct > EXTRA_THRESHOLDS.spinningTopMaxBodyPct) return null;
    if (parts.upperShadow <= parts.body || parts.lowerShadow <= parts.body) return null;

    return { price: candle.close };
  }
}
