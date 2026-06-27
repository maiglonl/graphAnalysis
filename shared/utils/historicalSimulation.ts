import {
  TradeActionEnum,
  type Candle,
  type IntervalEnum,
  type PatternIdEnum,
  type TradeSuggestion,
} from '#shared/types/market';
import { HISTORICAL_SIMULATION, SCANNER } from '#shared/utils/detectors/constants';
import { buildSuggestion, scanPatterns } from '#shared/utils/scanner';

export type HistoricalSimulationTradeResult = 'win' | 'loss' | 'open' | 'expired';

export type HistoricalSimulationTrade = {
  entryTime: number;
  exitTime: number | null;
  action: TradeActionEnum;
  entry: number;
  stop: number;
  target: number;
  result: HistoricalSimulationTradeResult;
  patterns: PatternIdEnum[];
  confidence: number;
};

export type HistoricalSimulationResult = {
  symbol: string;
  interval: IntervalEnum;
  trades: HistoricalSimulationTrade[];
  metrics: {
    totalTrades: number;
    wins: number;
    losses: number;
    winRate: number;
    averageRiskReward: number;
  };
};

export type RunHistoricalSimulationParams = {
  symbol: string;
  interval: IntervalEnum;
  candles: Candle[];
};

export function runHistoricalSimulation(params: RunHistoricalSimulationParams): HistoricalSimulationResult {
  const trades: HistoricalSimulationTrade[] = [];

  for (let index = SCANNER.minCandles; index < params.candles.length - 1; index += 1) {
    const sample = params.candles.slice(0, index + 1);
    const patterns = scanPatterns(sample);
    const suggestion = buildSuggestion(sample, patterns);

    if (!isSimulatableSuggestion(suggestion)) continue;

    trades.push(simulateTrade(params.candles, index, suggestion));
  }

  return {
    symbol: params.symbol,
    interval: params.interval,
    trades,
    metrics: buildMetrics(trades),
  };
}

function isSimulatableSuggestion(suggestion: TradeSuggestion): suggestion is TradeSuggestion & {
  entry: number;
  stop: number;
  targets: [number, ...number[]];
} {
  return (
    (suggestion.action === TradeActionEnum.Buy || suggestion.action === TradeActionEnum.Sell) &&
    suggestion.confidence >= HISTORICAL_SIMULATION.minConfidence &&
    typeof suggestion.entry === 'number' &&
    typeof suggestion.stop === 'number' &&
    Boolean(suggestion.targets?.length)
  );
}

function simulateTrade(
  candles: Candle[],
  signalIndex: number,
  suggestion: TradeSuggestion & { entry: number; stop: number; targets: [number, ...number[]] },
): HistoricalSimulationTrade {
  const target = suggestion.targets[0];
  const futureCandles = candles.slice(signalIndex + 1, signalIndex + 1 + HISTORICAL_SIMULATION.maxLookaheadCandles);

  for (const candle of futureCandles) {
    if (suggestion.action === TradeActionEnum.Buy) {
      if (candle.low <= suggestion.stop) {
        return buildTrade(candle.time, suggestion, target, 'loss');
      }

      if (candle.high >= target) {
        return buildTrade(candle.time, suggestion, target, 'win');
      }
    }

    if (suggestion.action === TradeActionEnum.Sell) {
      if (candle.high >= suggestion.stop) {
        return buildTrade(candle.time, suggestion, target, 'loss');
      }

      if (candle.low <= target) {
        return buildTrade(candle.time, suggestion, target, 'win');
      }
    }
  }

  const signalCandle = candles[signalIndex];

  return {
    ...buildTrade(null, suggestion, target, 'expired'),
    entryTime: signalCandle?.time ?? 0,
  };
}

function buildTrade(
  exitTime: number | null,
  suggestion: TradeSuggestion & { entry: number; stop: number },
  target: number,
  result: HistoricalSimulationTradeResult,
): HistoricalSimulationTrade {
  return {
    entryTime: 0,
    exitTime,
    action: suggestion.action,
    entry: suggestion.entry,
    stop: suggestion.stop,
    target,
    result,
    patterns: suggestion.reasons,
    confidence: suggestion.confidence,
  };
}

function buildMetrics(trades: HistoricalSimulationTrade[]): HistoricalSimulationResult['metrics'] {
  const wins = trades.filter((trade) => trade.result === 'win').length;
  const losses = trades.filter((trade) => trade.result === 'loss').length;
  const closedTrades = wins + losses;

  return {
    totalTrades: trades.length,
    wins,
    losses,
    winRate: closedTrades ? round((wins / closedTrades) * 100) : 0,
    averageRiskReward: averageRiskReward(trades),
  };
}

function averageRiskReward(trades: HistoricalSimulationTrade[]): number {
  const values = trades
    .map((trade) => Math.abs(trade.target - trade.entry) / Math.abs(trade.entry - trade.stop))
    .filter((value) => Number.isFinite(value));

  if (!values.length) return 0;

  return round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function round(value: number): number {
  return Number(value.toFixed(2));
}
