import type { Candle } from '#shared/types/market';
import { StructureTrendEnum } from '#shared/types/market';
import { atr, ema, getTrend, relativeVolume } from '#shared/utils/indicators';

export class ScanContext {
  readonly candles: Candle[];
  readonly index: number;
  readonly ema20: number[];
  readonly ema50: number[];
  readonly atr14: number[];
  readonly relativeVolume20: number[];

  constructor(candles: Candle[]) {
    const closes = candles.map((c) => c.close);
    this.candles = candles;
    this.index = candles.length - 1;
    this.ema20 = ema(closes, 20);
    this.ema50 = ema(closes, 50);
    this.atr14 = atr(candles, 14);
    this.relativeVolume20 = relativeVolume(candles, 20);
  }

  get currentCandle(): Candle | undefined {
    return this.candles[this.index];
  }

  get currentAtr(): number {
    return this.atr14[this.index] ?? 0;
  }

  get currentRelativeVolume(): number {
    const value = this.relativeVolume20[this.index];
    return value && Number.isFinite(value) ? value : 0;
  }

  trend(): StructureTrendEnum {
    const current = this.currentCandle;
    if (!current) return StructureTrendEnum.Neutral;
    return getTrend(this.index, current.close, this.ema20, this.ema50);
  }
}

export function createScanContext(candles: Candle[]): ScanContext {
  return new ScanContext(candles);
}
