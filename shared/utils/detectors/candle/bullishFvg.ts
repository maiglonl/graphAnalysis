import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { FvgDetector } from './FvgDetector';
import { CONFIDENCE, ATR } from '../constants';
import { round } from '../helpers';

export class BullishFvgDetector extends FvgDetector {
  override readonly id = PatternIdEnum.BullishFvg;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = CONFIDENCE.bullishFvg;

  protected override calcGap(c1: Candle, c3: Candle) { return c3.low - c1.high; }
  protected override isMiddleConfirming(c2: Candle) { return c2.close > c2.open; }
  protected override calcEntry(c1: Candle, _c3: Candle, gap: number) { return c1.high + gap / 2; }
  protected override calcStop(c1: Candle, atrValue: number) { return round(c1.high - atrValue * ATR.fvgStopOffset); }
  protected override buildMeta(c1: Candle, c3: Candle, gap: number) {
    return { gapStart: c1.high, gapEnd: c3.low, gapSize: gap };
  }
}
