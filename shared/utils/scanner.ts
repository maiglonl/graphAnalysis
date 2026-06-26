import type { Candle, PatternSignal, TradeSuggestion } from '../types/market';
import { PatternDirectionEnum, PatternIdEnum, TradeActionEnum } from '../types/market';
import { atr, isUptrend, isDowntrend, getLastSwingHigh, getLastSwingLow } from './indicators';

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

function round(value: number, decimals = 2) {
  return Number(value.toFixed(decimals));
}

export function detectHammer(candles: Candle[], index: number): PatternSignal | null {
  const candle = candles[index];
  if (!candle) return null;

  const parts = candleParts(candle);

  const valid =
    isDowntrend(candles, index) &&
    parts.range > 0 &&
    parts.bodyPct <= 0.35 &&
    parts.lowerShadow >= parts.body * 2 &&
    parts.upperShadow <= parts.body * 0.25 &&
    parts.closePosition >= 0.55;

  if (!valid) return null;

  return {
    id: PatternIdEnum.Hammer,
    direction: PatternDirectionEnum.Bullish,
    confidence: 68,
    price: candle.close,
    entry: candle.high,
    stop: candle.low,
    targets: [
      round(candle.high + (candle.high - candle.low) * 2),
      round(candle.high + (candle.high - candle.low) * 3),
    ],
  };
}

export function detectShootingStar(candles: Candle[], index: number): PatternSignal | null {
  const candle = candles[index];
  if (!candle) return null;

  const parts = candleParts(candle);

  const valid =
    isUptrend(candles, index) &&
    parts.range > 0 &&
    parts.bodyPct <= 0.35 &&
    parts.upperShadow >= parts.body * 2 &&
    parts.lowerShadow <= parts.body * 0.25 &&
    parts.closePosition <= 0.45;

  if (!valid) return null;

  return {
    id: PatternIdEnum.ShootingStar,
    direction: PatternDirectionEnum.Bearish,
    confidence: 68,
    price: candle.close,
    entry: candle.low,
    stop: candle.high,
    targets: [
      round(candle.low - (candle.high - candle.low) * 2),
      round(candle.low - (candle.high - candle.low) * 3),
    ],
  };
}

export function detectDoji(candles: Candle[], index: number): PatternSignal | null {
  const candle = candles[index];
  if (!candle) return null;

  const parts = candleParts(candle);

  if (parts.range <= 0 || parts.bodyPct > 0.1) return null;

  return {
    id: PatternIdEnum.Doji,
    direction: PatternDirectionEnum.Neutral,
    confidence: 45,
    price: candle.close,
  };
}

export function detectBullishEngulfing(candles: Candle[], index: number): PatternSignal | null {
  if (index < 1) return null;

  const previous = candles[index - 1];
  const current = candles[index];

  const previousParts = candleParts(previous);
  const currentParts = candleParts(current);

  const valid =
    isDowntrend(candles, index) &&
    previousParts.isBearish &&
    currentParts.isBullish &&
    current.open <= previous.close &&
    current.close >= previous.open &&
    currentParts.body >= previousParts.body * 1.05 &&
    currentParts.bodyPct >= 0.5;

  if (!valid) return null;

  const patternLow = Math.min(previous.low, current.low);
  const patternHigh = Math.max(previous.high, current.high);
  const risk = patternHigh - patternLow;

  return {
    id: PatternIdEnum.BullishEngulfing,
    direction: PatternDirectionEnum.Bullish,
    confidence: 74,
    price: current.close,
    entry: patternHigh,
    stop: patternLow,
    targets: [round(patternHigh + risk * 2), round(patternHigh + risk * 3)],
  };
}

export function detectBearishEngulfing(candles: Candle[], index: number): PatternSignal | null {
  if (index < 1) return null;

  const previous = candles[index - 1];
  const current = candles[index];

  const previousParts = candleParts(previous);
  const currentParts = candleParts(current);

  const valid =
    isUptrend(candles, index) &&
    previousParts.isBullish &&
    currentParts.isBearish &&
    current.open >= previous.close &&
    current.close <= previous.open &&
    currentParts.body >= previousParts.body * 1.05 &&
    currentParts.bodyPct >= 0.5;

  if (!valid) return null;

  const patternLow = Math.min(previous.low, current.low);
  const patternHigh = Math.max(previous.high, current.high);
  const risk = patternHigh - patternLow;

  return {
    id: PatternIdEnum.BearishEngulfing,
    direction: PatternDirectionEnum.Bearish,
    confidence: 74,
    price: current.close,
    entry: patternLow,
    stop: patternHigh,
    targets: [round(patternLow - risk * 2), round(patternLow - risk * 3)],
  };
}

export function detectInsideBar(candles: Candle[], index: number): PatternSignal | null {
  if (index < 1) return null;

  const mother = candles[index - 1];
  const current = candles[index];

  const valid = current.high <= mother.high && current.low >= mother.low;

  if (!valid) return null;

  return {
    id: PatternIdEnum.InsideBar,
    direction: PatternDirectionEnum.Neutral,
    confidence: 55,
    price: current.close,
    entry: mother.high,
    stop: mother.low,
    targets: [
      round(mother.high + (mother.high - mother.low) * 1.5),
      round(mother.high + (mother.high - mother.low) * 2),
    ],
  };
}

export function detectBullishFvg(candles: Candle[], index: number): PatternSignal | null {
  if (index < 2) return null;

  const c1 = candles[index - 2];
  const c2 = candles[index - 1];
  const c3 = candles[index];

  const atrValues = atr(candles);
  const currentAtr = atrValues[index] || 0;

  const gap = c3.low - c1.high;

  const valid = gap > 0 && gap >= currentAtr * 0.1 && c2.close > c2.open;

  if (!valid) return null;

  const midGap = c1.high + gap / 2;

  return {
    id: PatternIdEnum.BullishFvg,
    direction: PatternDirectionEnum.Bullish,
    confidence: 70,
    price: c3.close,
    entry: round(midGap),
    stop: round(c1.high - currentAtr * 0.1),
    targets: [round(c3.close + currentAtr * 2), round(c3.close + currentAtr * 3)],
    meta: {
      gapStart: c1.high,
      gapEnd: c3.low,
      gapSize: gap,
    },
  };
}

export function detectBearishFvg(candles: Candle[], index: number): PatternSignal | null {
  if (index < 2) return null;

  const c1 = candles[index - 2];
  const c2 = candles[index - 1];
  const c3 = candles[index];

  const atrValues = atr(candles);
  const currentAtr = atrValues[index] || 0;

  const gap = c1.low - c3.high;

  const valid = gap > 0 && gap >= currentAtr * 0.1 && c2.close < c2.open;

  if (!valid) return null;

  const midGap = c3.high + gap / 2;

  return {
    id: PatternIdEnum.BearishFvg,
    direction: PatternDirectionEnum.Bearish,
    confidence: 70,
    price: c3.close,
    entry: round(midGap),
    stop: round(c1.low + currentAtr * 0.1),
    targets: [round(c3.close - currentAtr * 2), round(c3.close - currentAtr * 3)],
    meta: {
      gapStart: c3.high,
      gapEnd: c1.low,
      gapSize: gap,
    },
  };
}

export function detectBos(candles: Candle[], index: number): PatternSignal | null {
  const current = candles[index];
  if (!current) return null;

  const lastHigh = getLastSwingHigh(candles, index);
  const lastLow = getLastSwingLow(candles, index);

  const atrValues = atr(candles);
  const currentAtr = atrValues[index] || 0;
  const buffer = currentAtr * 0.05;

  if (lastHigh && current.close > lastHigh.price + buffer) {
    return {
      id: PatternIdEnum.BullishBos,
      direction: PatternDirectionEnum.Bullish,
      confidence: 76,
      price: current.close,
      entry: current.close,
      stop: lastLow?.price,
      targets: lastLow
        ? [
            round(current.close + (current.close - lastLow.price) * 2),
            round(current.close + (current.close - lastLow.price) * 3),
          ]
        : undefined,
      meta: { brokenSwingHigh: lastHigh.price },
    };
  }

  if (lastLow && current.close < lastLow.price - buffer) {
    return {
      id: PatternIdEnum.BearishBos,
      direction: PatternDirectionEnum.Bearish,
      confidence: 76,
      price: current.close,
      entry: current.close,
      stop: lastHigh?.price,
      targets: lastHigh
        ? [
            round(current.close - (lastHigh.price - current.close) * 2),
            round(current.close - (lastHigh.price - current.close) * 3),
          ]
        : undefined,
      meta: { brokenSwingLow: lastLow.price },
    };
  }

  return null;
}

export function scanPatterns(candles: Candle[]): PatternSignal[] {
  const index = candles.length - 1;

  if (index < 50) return [];

  const detectors = [
    detectHammer,
    detectShootingStar,
    detectDoji,
    detectBullishEngulfing,
    detectBearishEngulfing,
    detectInsideBar,
    detectBullishFvg,
    detectBearishFvg,
    detectBos,
  ];

  return detectors
    .map((detector) => detector(candles, index))
    .filter(Boolean) as PatternSignal[];
}

export function buildSuggestion(candles: Candle[], patterns: PatternSignal[]): TradeSuggestion {
  if (candles.length === 0 || patterns.length === 0) {
    return {
      action: TradeActionEnum.None,
      confidence: 0,
      reasons: [],
    };
  }

  const bullish = patterns.filter((p) => p.direction === PatternDirectionEnum.Bullish);
  const bearish = patterns.filter((p) => p.direction === PatternDirectionEnum.Bearish);

  const bullishScore = bullish.reduce((sum, p) => sum + p.confidence, 0);
  const bearishScore = bearish.reduce((sum, p) => sum + p.confidence, 0);

  const best =
    bullishScore > bearishScore
      ? bullish.sort((a, b) => b.confidence - a.confidence)[0]
      : bearish.sort((a, b) => b.confidence - a.confidence)[0];

  if (!best) {
    return {
      action: TradeActionEnum.Wait,
      confidence: 45,
      reasons: patterns.map((p) => p.id),
    };
  }

  const confidence = Math.min(
    95,
    Math.round(best.confidence + Math.max(0, patterns.length - 1) * 4),
  );

  const action =
    best.direction === PatternDirectionEnum.Bullish ? TradeActionEnum.Buy : TradeActionEnum.Sell;

  return {
    action,
    confidence,
    entry: best.entry,
    stop: best.stop,
    targets: best.targets,
    reasons: patterns.map((p) => p.id),
  };
}
