import {
  TradeActionEnum,
  type Candle,
  type HistoricalPatternStat,
  type HistoricalSimulationResult,
  type HistoricalTrade,
  type IntervalEnum,
  type PatternIdEnum,
} from '#shared/types/market';
import { HISTORICAL_SIMULATION, SCANNER } from '#shared/utils/detectors/constants';
import { aggregatePatternStatsByFamily } from '#shared/utils/patternFamilyStats';
import { buildSuggestion, scanPatterns } from '#shared/utils/scanner';

export type RunHistoricalSimulationParams = {
  symbol: string;
  interval: IntervalEnum;
  candles: Candle[];
};

export function runHistoricalSimulation(params: RunHistoricalSimulationParams): HistoricalSimulationResult {
  const trades: HistoricalTrade[] = [];

  for (let index = SCANNER.minCandles; index < params.candles.length - 1; index += 1) {
    const visibleCandles = params.candles.slice(0, index + 1);
    const futureCandles = params.candles.slice(index + 1, index + 1 + HISTORICAL_SIMULATION.maxLookaheadCandles);
    const patterns = scanPatterns(visibleCandles);
    const suggestion = buildSuggestion(visibleCandles, patterns);

    if (!isActionableSuggestion(suggestion.action)) continue;
    if (suggestion.confidence < HISTORICAL_SIMULATION.minConfidence) continue;
    if (suggestion.entry == null || suggestion.stop == null || !suggestion.targets?.length) continue;

    trades.push(resolveTrade({
      futureCandles,
      action: suggestion.action,
      entry: suggestion.entry,
      stop: suggestion.stop,
      target: suggestion.targets[0],
      patterns: suggestion.reasons,
      confidence: suggestion.confidence,
      entryTime: visibleCandles.at(-1)?.time ?? 0,
    }));
  }

  const patternStats = buildPatternStats(trades);

  return {
    symbol: params.symbol,
    interval: params.interval,
    trades,
    metrics: buildMetrics(trades),
    patternStats,
    familyStats: aggregatePatternStatsByFamily(patternStats),
  };
}

function isActionableSuggestion(action: TradeActionEnum): boolean {
  return action === TradeActionEnum.Buy || action === TradeActionEnum.Sell;
}

type ResolveTradeParams = Pick<HistoricalTrade, 'action' | 'entry' | 'stop' | 'target' | 'patterns' | 'confidence' | 'entryTime'> & {
  futureCandles: Candle[];
};

function resolveTrade(params: ResolveTradeParams): HistoricalTrade {
  for (const candle of params.futureCandles) {
    const hitTarget = params.action === TradeActionEnum.Buy
      ? candle.high >= params.target
      : candle.low <= params.target;

    const hitStop = params.action === TradeActionEnum.Buy
      ? candle.low <= params.stop
      : candle.high >= params.stop;

    if (hitStop || hitTarget) {
      return {
        entryTime: params.entryTime,
        exitTime: candle.time,
        action: params.action,
        entry: params.entry,
        stop: params.stop,
        target: params.target,
        result: hitTarget && !hitStop ? 'win' : 'loss',
        patterns: params.patterns,
        confidence: params.confidence,
      };
    }
  }

  return {
    entryTime: params.entryTime,
    exitTime: null,
    action: params.action,
    entry: params.entry,
    stop: params.stop,
    target: params.target,
    result: 'expired',
    patterns: params.patterns,
    confidence: params.confidence,
  };
}

function buildMetrics(trades: HistoricalTrade[]): HistoricalSimulationResult['metrics'] {
  const wins = trades.filter((trade) => trade.result === 'win').length;
  const losses = trades.filter((trade) => trade.result === 'loss').length;
  const expired = trades.filter((trade) => trade.result === 'expired').length;
  const closedTrades = wins + losses;

  return {
    totalTrades: trades.length,
    wins,
    losses,
    expired,
    winRate: closedTrades > 0 ? round((wins / closedTrades) * 100) : 0,
    lossRate: closedTrades > 0 ? round((losses / closedTrades) * 100) : 0,
    averageRiskReward: round(averageRiskReward(trades)),
    averageReturn: round(averageReturn(trades)),
    maxDrawdown: round(maxDrawdown(trades)),
    averageConfidence: round(averageConfidence(trades)),
  };
}

function buildPatternStats(trades: HistoricalTrade[]): HistoricalPatternStat[] {
  const patternMap = new Map<PatternIdEnum, HistoricalTrade[]>();

  trades.forEach((trade) => {
    trade.patterns.forEach((patternId) => {
      patternMap.set(patternId, [...(patternMap.get(patternId) ?? []), trade]);
    });
  });

  return [...patternMap.entries()]
    .map(([patternId, patternTrades]) => {
      const wins = patternTrades.filter((trade) => trade.result === 'win').length;
      const losses = patternTrades.filter((trade) => trade.result === 'loss').length;
      const expired = patternTrades.filter((trade) => trade.result === 'expired').length;
      const closedTrades = wins + losses;

      return {
        patternId,
        totalTrades: patternTrades.length,
        wins,
        losses,
        expired,
        winRate: closedTrades > 0 ? round((wins / closedTrades) * 100) : 0,
        averageReturn: round(averageReturn(patternTrades)),
        averageConfidence: round(averageConfidence(patternTrades)),
      };
    })
    .sort((a, b) => b.totalTrades - a.totalTrades);
}

function averageRiskReward(trades: HistoricalTrade[]): number {
  const tradesWithRisk = trades.filter((trade) => Math.abs(trade.entry - trade.stop) > 0);

  if (!tradesWithRisk.length) return 0;

  const total = tradesWithRisk.reduce((sum, trade) => {
    const risk = Math.abs(trade.entry - trade.stop);
    const reward = Math.abs(trade.target - trade.entry);
    return sum + reward / risk;
  }, 0);

  return total / tradesWithRisk.length;
}

function averageReturn(trades: HistoricalTrade[]): number {
  if (!trades.length) return 0;

  const total = trades.reduce((sum, trade) => sum + tradeReturn(trade), 0);

  return total / trades.length;
}

function maxDrawdown(trades: HistoricalTrade[]): number {
  let peak = 0;
  let equity = 0;
  let worstDrawdown = 0;

  trades.forEach((trade) => {
    equity += tradeReturn(trade);
    peak = Math.max(peak, equity);
    worstDrawdown = Math.max(worstDrawdown, peak - equity);
  });

  return worstDrawdown;
}

function averageConfidence(trades: HistoricalTrade[]): number {
  if (!trades.length) return 0;

  return trades.reduce((sum, trade) => sum + trade.confidence, 0) / trades.length;
}

function tradeReturn(trade: HistoricalTrade): number {
  if (trade.result === 'expired') return 0;

  const exit = trade.result === 'win' ? trade.target : trade.stop;
  const directionMultiplier = trade.action === TradeActionEnum.Buy ? 1 : -1;

  return ((exit - trade.entry) / trade.entry) * directionMultiplier * 100;
}

function round(value: number): number {
  return Number(value.toFixed(2));
}
