import type { Candle, MarketStructure, SwingPoint } from '#shared/types/market';
import { MarketStructurePointEnum, StructureTrendEnum, SwingPointTypeEnum } from '#shared/types/market';
import { isSwingHigh, isSwingLow } from '#shared/utils/indicators';

export function getSwingHighs(candles: Candle[], beforeIndex: number, limit = 10): SwingPoint[] {
  const result: SwingPoint[] = [];

  for (let i = beforeIndex - 2; i >= 2; i--) {
    if (isSwingHigh(candles, i)) {
      result.push({ index: i, price: candles[i].high, type: SwingPointTypeEnum.High });
    }

    if (result.length >= limit) break;
  }

  return result;
}

export function getSwingLows(candles: Candle[], beforeIndex: number, limit = 10): SwingPoint[] {
  const result: SwingPoint[] = [];

  for (let i = beforeIndex - 2; i >= 2; i--) {
    if (isSwingLow(candles, i)) {
      result.push({ index: i, price: candles[i].low, type: SwingPointTypeEnum.Low });
    }

    if (result.length >= limit) break;
  }

  return result;
}

export function getMarketStructure(candles: Candle[], index: number, atrValue = 0): MarketStructure {
  const highs = getSwingHighs(candles, index, 5);
  const lows = getSwingLows(candles, index, 5);

  const lastHigh = highs[0] ?? null;
  const previousHigh = highs[1] ?? null;

  const lastLow = lows[0] ?? null;
  const previousLow = lows[1] ?? null;

  const buffer = atrValue * 0.05;
  const points: MarketStructurePointEnum[] = [];

  if (lastHigh && previousHigh) {
    if (lastHigh.price > previousHigh.price + buffer) points.push(MarketStructurePointEnum.HigherHigh);
    if (lastHigh.price < previousHigh.price - buffer) points.push(MarketStructurePointEnum.LowerHigh);
  }

  if (lastLow && previousLow) {
    if (lastLow.price > previousLow.price + buffer) points.push(MarketStructurePointEnum.HigherLow);
    if (lastLow.price < previousLow.price - buffer) points.push(MarketStructurePointEnum.LowerLow);
  }

  const hasHH = points.includes(MarketStructurePointEnum.HigherHigh);
  const hasHL = points.includes(MarketStructurePointEnum.HigherLow);
  const hasLH = points.includes(MarketStructurePointEnum.LowerHigh);
  const hasLL = points.includes(MarketStructurePointEnum.LowerLow);

  let trend = StructureTrendEnum.Neutral;
  if (hasHH && hasHL) trend = StructureTrendEnum.Bullish;
  if (hasLH && hasLL) trend = StructureTrendEnum.Bearish;

  return {
    lastHigh,
    previousHigh,
    lastLow,
    previousLow,
    points,
    trend,
  };
}
