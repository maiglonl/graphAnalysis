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
  BullishChoch = 'bullishChoch',
  BearishChoch = 'bearishChoch',
  HigherHigh = 'higherHigh',
  HigherLow = 'higherLow',
  LowerHigh = 'lowerHigh',
  LowerLow = 'lowerLow',
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
  OneMinute = '1m',
  FiveMinutes = '5m',
  FifteenMinutes = '15m',
  ThirtyMinutes = '30m',
  OneHour = '1h',
  FourHours = '4h',
  OneDay = '1d',
}

export const DEFAULT_SYMBOL = 'BTCUSDT';
export const DEFAULT_INTERVAL = IntervalEnum.OneHour;

export enum MarketDataErrorCodeEnum {
  InvalidSymbol = 'invalidSymbol',
  InvalidInterval = 'invalidInterval',
  RateLimited = 'rateLimited',
  Timeout = 'timeout',
  EmptyResponse = 'emptyResponse',
  ProviderUnavailable = 'providerUnavailable',
}

export type SuggestionScoreBreakdown = {
  patternScore: number;
  structureScore: number;
  trendScore: number;
  volumeScore: number;
  confluenceBonus: number;
  conflictPenalty: number;
};

export type RiskPlan = {
  accountSize: number;
  riskPercent: number;
  riskAmount: number;
  entry: number;
  stop: number;
  stopDistance: number;
  positionSize: number;
  quantity: number;
  riskRewardByTarget: number[];
};

export type TradeSuggestion = {
  action: TradeActionEnum;
  confidence: number;
  entry?: number;
  stop?: number;
  targets?: number[];
  reasons: PatternIdEnum[];
  scoreBreakdown: SuggestionScoreBreakdown;
};

export type AnalyzeResponse = {
  symbol: string;
  interval: IntervalEnum;
  price: number | null;
  updatedAt: number | null;
  candles: Candle[];
  suggestion: TradeSuggestion;
  patterns: PatternSignal[];
  structure: MarketStructure;
  disclaimer: string;
};

export type ScanListResponse = {
  interval: IntervalEnum;
  items: AnalyzeResponse[];
};

export type HistoricalTradeResult = 'win' | 'loss' | 'expired';

export type HistoricalTrade = {
  entryTime: number;
  exitTime: number | null;
  action: TradeActionEnum;
  entry: number;
  stop: number;
  target: number;
  result: HistoricalTradeResult;
  patterns: PatternIdEnum[];
  confidence: number;
};

export type HistoricalSimulationResult = {
  symbol: string;
  interval: IntervalEnum;
  trades: HistoricalTrade[];
  metrics: {
    totalTrades: number;
    wins: number;
    losses: number;
    expired: number;
    winRate: number;
    averageRiskReward: number;
  };
};

export enum MarketStructurePointEnum {
  HigherHigh = 'HH',
  HigherLow = 'HL',
  LowerHigh = 'LH',
  LowerLow = 'LL',
}

export enum StructureTrendEnum {
  Bullish = 'bullish',
  Bearish = 'bearish',
  Neutral = 'neutral',
}

export enum SwingPointTypeEnum {
  High = 'high',
  Low = 'low',
}

export type SwingPoint = {
  index: number;
  price: number;
  type: SwingPointTypeEnum;
};

export type MarketStructure = {
  lastHigh: SwingPoint | null;
  previousHigh: SwingPoint | null;
  lastLow: SwingPoint | null;
  previousLow: SwingPoint | null;
  points: MarketStructurePointEnum[];
  trend: StructureTrendEnum;
};
