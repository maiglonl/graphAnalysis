import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IntervalEnum, TradeActionEnum, type Candle, type TradeSuggestion } from '#shared/types/market';

const scannerMocks = vi.hoisted(() => ({
  scanPatterns: vi.fn(),
  buildSuggestion: vi.fn(),
}));

vi.mock('#shared/utils/scanner', () => scannerMocks);

import { runHistoricalSimulation } from '../../server/utils/historicalSimulation';

const scoreBreakdown = {
  patternScore: 60,
  structureScore: 0,
  trendScore: 0,
  volumeScore: 0,
  confluenceBonus: 0,
  conflictPenalty: 0,
};

function makeCandles(future: Candle): Candle[] {
  return [
    ...Array.from({ length: 51 }, (_, index) => ({
      time: index + 1,
      open: 100,
      high: 105,
      low: 95,
      close: 100,
      volume: 1000,
    })),
    future,
  ];
}

function makeSuggestion(overrides: Partial<TradeSuggestion> = {}): TradeSuggestion {
  return {
    action: TradeActionEnum.Buy,
    confidence: 60,
    entry: 100,
    stop: 90,
    targets: [110],
    reasons: [],
    scoreBreakdown,
    ...overrides,
  };
}

describe('historical simulation', () => {
  beforeEach(() => {
    scannerMocks.scanPatterns.mockReturnValue([]);
    scannerMocks.buildSuggestion.mockReset();
  });

  it('records a winning buy trade when target is reached', () => {
    scannerMocks.buildSuggestion.mockReturnValue(makeSuggestion());

    const result = runHistoricalSimulation({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      candles: makeCandles({ time: 52, open: 100, high: 111, low: 95, close: 110, volume: 1000 }),
    });

    expect(result.trades[0]?.result).toBe('win');
    expect(result.metrics).toMatchObject({
      totalTrades: 1,
      wins: 1,
      losses: 0,
      expired: 0,
      winRate: 100,
      lossRate: 0,
      averageReturn: 10,
      maxDrawdown: 0,
      averageConfidence: 60,
    });
  });

  it('records a losing sell trade when stop is reached', () => {
    scannerMocks.buildSuggestion.mockReturnValue(makeSuggestion({
      action: TradeActionEnum.Sell,
      entry: 100,
      stop: 110,
      targets: [90],
    }));

    const result = runHistoricalSimulation({
      symbol: 'ETHUSDT',
      interval: IntervalEnum.OneHour,
      candles: makeCandles({ time: 52, open: 100, high: 111, low: 95, close: 100, volume: 1000 }),
    });

    expect(result.trades[0]?.result).toBe('loss');
    expect(result.metrics).toMatchObject({
      totalTrades: 1,
      wins: 0,
      losses: 1,
      expired: 0,
      winRate: 0,
      lossRate: 100,
      averageReturn: -10,
      maxDrawdown: 10,
      averageConfidence: 60,
    });
  });

  it('records an expired trade when neither target nor stop is reached', () => {
    scannerMocks.buildSuggestion.mockReturnValue(makeSuggestion());

    const result = runHistoricalSimulation({
      symbol: 'SOLUSDT',
      interval: IntervalEnum.OneHour,
      candles: makeCandles({ time: 52, open: 100, high: 105, low: 95, close: 100, volume: 1000 }),
    });

    expect(result.trades[0]?.result).toBe('expired');
    expect(result.metrics).toMatchObject({ totalTrades: 1, wins: 0, losses: 0, expired: 1, winRate: 0, averageReturn: 0 });
  });

  it('ignores non actionable suggestions', () => {
    scannerMocks.buildSuggestion.mockReturnValue(makeSuggestion({
      action: TradeActionEnum.Wait,
      confidence: 60,
    }));

    const result = runHistoricalSimulation({
      symbol: 'XRPUSDT',
      interval: IntervalEnum.OneHour,
      candles: makeCandles({ time: 52, open: 100, high: 111, low: 95, close: 110, volume: 1000 }),
    });

    expect(result.trades).toEqual([]);
    expect(result.metrics.totalTrades).toBe(0);
  });
});
