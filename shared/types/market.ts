export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export enum PatternDirectionEnum {
  Bullish = "bullish",
  Bearish = "bearish",
  Neutral = "neutral",
}

export type PatternSignal = {
  id: string;
  name: string;
  direction: PatternDirectionEnum;
  confidence: number;
  price?: number;
  entry?: number;
  stop?: number;
  targets?: number[];
  reason: string;
  meta?: Record<string, unknown>;
};

export enum TradeActionEnum {
  Buy = "buy",
  Sell = "sell",
  Wait = "wait",
  None = "none",
}

export type TradeSuggestion = {
  action: TradeActionEnum;
  label: string;
  confidence: number;
  entry?: number;
  stop?: number;
  targets?: number[];
  reasons: string[];
};

export type AnalyzeResponse = {
  symbol: string;
  interval: string;
  price: number | null;
  updatedAt: number | null;
  suggestion: TradeSuggestion;
  patterns: PatternSignal[];
  disclaimer: string;
};
