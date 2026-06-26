import type { Candle } from '#shared/types/market';
import { PatternDirectionEnum, PatternIdEnum } from '#shared/types/market';
import { atr, isDowntrend, isUptrend } from '#shared/utils/indicators';
import { CandlePatternDetector } from './base';

function round(value: number, decimals = 2) {
  return Number(value.toFixed(decimals));
}

function candleParts(candle: Candle) {
  const range = candle.high - candle.low;
  const body = Math.abs(candle.close - candle.open);
  const upperShadow = candle.high - Math.max(candle.open, candle.close);
  const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
  return {
    range,
    body,
    upperShadow,
    lowerShadow,
    bodyPct: range > 0 ? body / range : 0,
    isBullish: candle.close > candle.open,
    isBearish: candle.close < candle.open,
    closePosition: range > 0 ? (candle.close - candle.low) / range : 0.5,
  };
}

export class HammerDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.Hammer;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = 68;

  protected override match(candles: Candle[], index: number) {
    const candle = candles[index];
    if (!candle) return null;
    const p = candleParts(candle);
    const valid =
      isDowntrend(candles, index) &&
      p.range > 0 &&
      p.bodyPct <= 0.35 &&
      p.lowerShadow >= p.body * 2 &&
      p.upperShadow <= p.body * 0.25 &&
      p.closePosition >= 0.55;
    if (!valid) return null;
    return {
      price: candle.close,
      entry: candle.high,
      stop: candle.low,
      targets: [
        round(candle.high + (candle.high - candle.low) * 2),
        round(candle.high + (candle.high - candle.low) * 3),
      ],
    };
  }
}

export class ShootingStarDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.ShootingStar;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = 68;

  protected override match(candles: Candle[], index: number) {
    const candle = candles[index];
    if (!candle) return null;
    const p = candleParts(candle);
    const valid =
      isUptrend(candles, index) &&
      p.range > 0 &&
      p.bodyPct <= 0.35 &&
      p.upperShadow >= p.body * 2 &&
      p.lowerShadow <= p.body * 0.25 &&
      p.closePosition <= 0.45;
    if (!valid) return null;
    return {
      price: candle.close,
      entry: candle.low,
      stop: candle.high,
      targets: [
        round(candle.low - (candle.high - candle.low) * 2),
        round(candle.low - (candle.high - candle.low) * 3),
      ],
    };
  }
}

export class DojiDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.Doji;
  override readonly direction = PatternDirectionEnum.Neutral;
  override readonly baseConfidence = 45;

  protected override match(candles: Candle[], index: number) {
    const candle = candles[index];
    if (!candle) return null;
    const p = candleParts(candle);
    if (p.range <= 0 || p.bodyPct > 0.1) return null;
    return { price: candle.close };
  }
}

export class BullishEngulfingDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.BullishEngulfing;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = 74;

  protected override match(candles: Candle[], index: number) {
    if (index < 1) return null;
    const previous = candles[index - 1];
    const current = candles[index];
    if (!previous || !current) return null;
    const prev = candleParts(previous);
    const curr = candleParts(current);
    const valid =
      isDowntrend(candles, index) &&
      prev.isBearish &&
      curr.isBullish &&
      current.open <= previous.close &&
      current.close >= previous.open &&
      curr.body >= prev.body * 1.05 &&
      curr.bodyPct >= 0.5;
    if (!valid) return null;
    const low = Math.min(previous.low, current.low);
    const high = Math.max(previous.high, current.high);
    const risk = high - low;
    return {
      price: current.close,
      entry: high,
      stop: low,
      targets: [round(high + risk * 2), round(high + risk * 3)],
    };
  }
}

export class BearishEngulfingDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.BearishEngulfing;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = 74;

  protected override match(candles: Candle[], index: number) {
    if (index < 1) return null;
    const previous = candles[index - 1];
    const current = candles[index];
    if (!previous || !current) return null;
    const prev = candleParts(previous);
    const curr = candleParts(current);
    const valid =
      isUptrend(candles, index) &&
      prev.isBullish &&
      curr.isBearish &&
      current.open >= previous.close &&
      current.close <= previous.open &&
      curr.body >= prev.body * 1.05 &&
      curr.bodyPct >= 0.5;
    if (!valid) return null;
    const low = Math.min(previous.low, current.low);
    const high = Math.max(previous.high, current.high);
    const risk = high - low;
    return {
      price: current.close,
      entry: low,
      stop: high,
      targets: [round(low - risk * 2), round(low - risk * 3)],
    };
  }
}

export class InsideBarDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.InsideBar;
  override readonly direction = PatternDirectionEnum.Neutral;
  override readonly baseConfidence = 55;

  protected override match(candles: Candle[], index: number) {
    if (index < 1) return null;
    const mother = candles[index - 1];
    const current = candles[index];
    if (!mother || !current) return null;
    if (!(current.high <= mother.high && current.low >= mother.low)) return null;
    return {
      price: current.close,
      entry: mother.high,
      stop: mother.low,
      targets: [
        round(mother.high + (mother.high - mother.low) * 1.5),
        round(mother.high + (mother.high - mother.low) * 2),
      ],
    };
  }
}

export class BullishFvgDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.BullishFvg;
  override readonly direction = PatternDirectionEnum.Bullish;
  override readonly baseConfidence = 70;

  protected override match(candles: Candle[], index: number) {
    if (index < 2) return null;
    const c1 = candles[index - 2];
    const c2 = candles[index - 1];
    const c3 = candles[index];
    if (!c1 || !c2 || !c3) return null;
    const atrValues = atr(candles);
    const currentAtr = atrValues[index] ?? 0;
    const gap = c3.low - c1.high;
    if (!(gap > 0 && gap >= currentAtr * 0.1 && c2.close > c2.open)) return null;
    const midGap = c1.high + gap / 2;
    return {
      price: c3.close,
      entry: round(midGap),
      stop: round(c1.high - currentAtr * 0.1),
      targets: [round(c3.close + currentAtr * 2), round(c3.close + currentAtr * 3)],
      meta: { gapStart: c1.high, gapEnd: c3.low, gapSize: gap },
    };
  }
}

export class BearishFvgDetector extends CandlePatternDetector {
  override readonly id = PatternIdEnum.BearishFvg;
  override readonly direction = PatternDirectionEnum.Bearish;
  override readonly baseConfidence = 70;

  protected override match(candles: Candle[], index: number) {
    if (index < 2) return null;
    const c1 = candles[index - 2];
    const c2 = candles[index - 1];
    const c3 = candles[index];
    if (!c1 || !c2 || !c3) return null;
    const atrValues = atr(candles);
    const currentAtr = atrValues[index] ?? 0;
    const gap = c1.low - c3.high;
    if (!(gap > 0 && gap >= currentAtr * 0.1 && c2.close < c2.open)) return null;
    const midGap = c3.high + gap / 2;
    return {
      price: c3.close,
      entry: round(midGap),
      stop: round(c1.low + currentAtr * 0.1),
      targets: [round(c3.close - currentAtr * 2), round(c3.close - currentAtr * 3)],
      meta: { gapStart: c3.high, gapEnd: c1.low, gapSize: gap },
    };
  }
}
