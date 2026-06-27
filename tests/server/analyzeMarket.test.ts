import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  IntervalEnum,
  StructureTrendEnum,
  TradeActionEnum,
  type Candle,
  type MarketStructure,
  type TradeSuggestion,
} from '#shared/types/market';

const scannerMocks = vi.hoisted(() => ({
  scanPatterns: vi.fn(),
  buildSuggestion: vi.fn(),
}));

const marketStructureMocks = vi.hoisted(() => ({
  getMarketStructure: vi.fn(),
}));

vi.mock('#shared/utils/scanner', () => scannerMocks);
vi.mock('#shared/utils/marketStructure', () => marketStructureMocks);

import { analyzeMarket } from '../../server/utils/analyzeMarket';

const candles: Candle[] = Array.from({ length: 50 }, (_, index) => ({
  time: index + 1,
  open: 100,
  high: 105,
  low: 95,
  close: 100 + index,
  volume: 1000,
}));

const suggestion: TradeSuggestion = {
  action: TradeActionEnum.Buy,
  confidence: 70,
  reasons: [],
  scoreBreakdown: {
    patternScore: 70,
    structureScore: 0,
    trendScore: 0,
    volumeScore: 0,
    confluenceBonus: 0,
    conflictPenalty: 0,
  },
};

const structure: MarketStructure = {
  previousHigh: null,
  previousLow: null,
  lastHigh: null,
  lastLow: null,
  points: [],
  trend: StructureTrendEnum.Neutral,
};

describe('analyzeMarket', () => {
  beforeEach(() => {
    scannerMocks.scanPatterns.mockReturnValue([]);
    scannerMocks.buildSuggestion.mockReturnValue(suggestion);
    marketStructureMocks.getMarketStructure.mockReturnValue(structure);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('fetches candles and returns analysis response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      candles,
    });
    vi.stubGlobal('$fetch', fetchMock);

    const result = await analyzeMarket({ symbol: 'BTCUSDT', interval: IntervalEnum.OneHour });

    expect(fetchMock).toHaveBeenCalledWith('/api/candles', {
      query: {
        symbol: 'BTCUSDT',
        interval: IntervalEnum.OneHour,
        limit: 500,
      },
    });
    expect(scannerMocks.scanPatterns).toHaveBeenCalledWith(candles);
    expect(scannerMocks.buildSuggestion).toHaveBeenCalledWith(candles, []);
    expect(result).toMatchObject({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      price: 149,
      updatedAt: 50,
      suggestion,
      patterns: [],
      structure,
      disclaimer: 'common.disclaimer',
    });
  });

  it('returns null price and updatedAt when candles are empty', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({
      symbol: 'ETHUSDT',
      interval: IntervalEnum.FourHours,
      candles: [],
    }));

    const result = await analyzeMarket({ symbol: 'ETHUSDT', interval: IntervalEnum.FourHours });

    expect(result.price).toBeNull();
    expect(result.updatedAt).toBeNull();
  });
});
