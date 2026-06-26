export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export enum PatternDirectionEnum {
  Bullish = 'bullish',
  Bearish = 'bearish',
  Neutral = 'neutral',
}

export enum PatternIdEnum {
  Hammer = 'hammer',
  ShootingStar = 'shootingStar',
  Doji = 'doji',
  BullishEngulfing = 'bullishEngulfing',
  BearishEngulfing = 'bearishEngulfing',
  InsideBar = 'insideBar',
  BullishFvg = 'bullishFvg',
  BearishFvg = 'bearishFvg',
  BullishBos = 'bullishBos',
  BearishBos = 'bearishBos',
}

export type PatternSignal = {
  id: PatternIdEnum;
  direction: PatternDirectionEnum;
  confidence: number;
  price?: number;
  entry?: number;
  stop?: number;
  targets?: number[];
  meta?: Record<string, unknown>;
};

export enum TradeActionEnum {
  Buy = 'buy',
  Sell = 'sell',
  Wait = 'wait',
  None = 'none',
}

export enum IntervalEnum {
  FifteenMinutes = '15m',
  OneHour = '1h',
  FourHours = '4h',
  OneDay = '1d',
}

export const DEFAULT_SYMBOL = 'BTCUSDT';
export const DEFAULT_INTERVAL = IntervalEnum.OneHour;

export type TradeSuggestion = {
  action: TradeActionEnum;
  confidence: number;
  entry?: number;
  stop?: number;
  targets?: number[];
  reasons: PatternIdEnum[];
};

export type AnalyzeResponse = {
  symbol: string;
  interval: IntervalEnum;
  price: number | null;
  updatedAt: number | null;
  candles: Candle[];
  suggestion: TradeSuggestion;
  patterns: PatternSignal[];
  disclaimer: string;
};
