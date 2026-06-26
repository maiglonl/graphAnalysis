import type { Candle, MarketStructure, SwingPoint } from '#shared/types/market';
import { MarketStructurePointEnum, StructureTrendEnum, SwingPointTypeEnum } from '#shared/types/market';
import { isSwingHigh, isSwingLow } from '#shared/utils/indicators';
import { ATR } from '#shared/utils/detectors/constants';

const SWING_SEARCH_LIMIT = 5;

export function getSwingHighs(candles: Candle[], beforeIndex: number, limit = 10): SwingPoint[] {
  const result: SwingPoint[] = [];
  for (let i = beforeIndex - 2; i >= 2; i--) {
    if (isSwingHigh(candles, i)) {
      result.push({ index: i, price: candles[i]!.high, type: SwingPointTypeEnum.High });
    }
    if (result.length >= limit) break;
  }
  return result;
}

export function getSwingLows(candles: Candle[], beforeIndex: number, limit = 10): SwingPoint[] {
  const result: SwingPoint[] = [];
  for (let i = beforeIndex - 2; i >= 2; i--) {
    if (isSwingLow(candles, i)) {
      result.push({ index: i, price: candles[i]!.low, type: SwingPointTypeEnum.Low });
    }
    if (result.length >= limit) break;
  }
  return result;
}

export function getMarketStructure(candles: Candle[], index: number, atrValue = 0): MarketStructure {
  const recentHighs = getSwingHighs(candles, index, SWING_SEARCH_LIMIT);
  const recentLows = getSwingLows(candles, index, SWING_SEARCH_LIMIT);

  const lastHigh = recentHighs[0] ?? null;
  const previousHigh = recentHighs[1] ?? null;
  const lastLow = recentLows[0] ?? null;
  const previousLow = recentLows[1] ?? null;

  const atrTolerance = atrValue * ATR.breakoutTolerance;
  const points: MarketStructurePointEnum[] = [];

  if (lastHigh && previousHigh) {
    if (lastHigh.price > previousHigh.price + atrTolerance) points.push(MarketStructurePointEnum.HigherHigh);
    if (lastHigh.price < previousHigh.price - atrTolerance) points.push(MarketStructurePointEnum.LowerHigh);
  }

  if (lastLow && previousLow) {
    if (lastLow.price > previousLow.price + atrTolerance) points.push(MarketStructurePointEnum.HigherLow);
    if (lastLow.price < previousLow.price - atrTolerance) points.push(MarketStructurePointEnum.LowerLow);
  }

  const hasHH = points.includes(MarketStructurePointEnum.HigherHigh);
  const hasHL = points.includes(MarketStructurePointEnum.HigherLow);
  const hasLH = points.includes(MarketStructurePointEnum.LowerHigh);
  const hasLL = points.includes(MarketStructurePointEnum.LowerLow);

  let trend = StructureTrendEnum.Neutral;
  if (hasHH && hasHL) trend = StructureTrendEnum.Bullish;
  if (hasLH && hasLL) trend = StructureTrendEnum.Bearish;

  return { lastHigh, previousHigh, lastLow, previousLow, points, trend };
}
