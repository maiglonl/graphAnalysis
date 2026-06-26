import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { FvgDetector } from './FvgDetector';
import { CONFIDENCE, ATR } from '../constants';
import { round } from '../helpers';

export class BearishFvgDetector extends FvgDetector {
  override readonly id = PatternIdEnum.BearishFvg;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = CONFIDENCE.bearishFvg;

  protected override calcGap(c1: Candle, c3: Candle) { return c1.low - c3.high; }
  protected override isMiddleConfirming(c2: Candle) { return c2.close < c2.open; }
  protected override calcEntry(_c1: Candle, c3: Candle, gap: number) { return c3.high + gap / 2; }
  protected override calcStop(c1: Candle, atrValue: number) { return round(c1.low + atrValue * ATR.fvgStopOffset); }
  protected override buildMeta(c1: Candle, c3: Candle, gap: number) {
    return { gapStart: c3.high, gapEnd: c1.low, gapSize: gap };
  }
}
