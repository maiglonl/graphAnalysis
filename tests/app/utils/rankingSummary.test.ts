import { describe, expect, it } from 'vitest';
import { IntervalEnum, StructureTrendEnum, TradeActionEnum } from '#shared/types/market';
import { computeRankingSummary } from '~/utils/rankingSummary';
import type { AnalyzeResponse } from '#shared/types/market';

function makeItem(
  symbol: string,
  action: TradeActionEnum,
  confidence: number,
): AnalyzeResponse {
  return {
    symbol,
    interval: IntervalEnum.OneHour,
    price: 100,
    updatedAt: Date.now(),
    candles: [],
    patterns: [],
    structure: {
      lastHigh: null,
      previousHigh: null,
      lastLow: null,
      previousLow: null,
      points: [],
      trend: StructureTrendEnum.Neutral,
    },
    disclaimer: '',
    signalQualitySummary: {
      byFamily: [],
      byRole: [],
    },
    suggestion: {
      action,
      confidence,
      reasons: [],
      scoreBreakdown: {
        patternScore: 0,
        structureScore: 0,
        trendScore: 0,
        volumeScore: 0,
        confluenceBonus: 0,
        conflictPenalty: 0,
      },
    },
  };
}

describe('computeRankingSummary', () => {
  it('returns zeroed summary for empty list', () => {
    const result = computeRankingSummary([]);
    expect(result).toEqual({
      total: 0,
      actionable: 0,
      buyCount: 0,
      sellCount: 0,
      waitCount: 0,
      bestConfidence: null,
      bestSymbol: null,
    });
  });

  it('counts buy, sell and wait correctly', () => {
    const items = [
      makeItem('BTCUSDT', TradeActionEnum.Buy, 80),
      makeItem('ETHUSDT', TradeActionEnum.Sell, 70),
      makeItem('SOLUSDT', TradeActionEnum.Wait, 50),
      makeItem('BNBUSDT', TradeActionEnum.Buy, 65),
    ];
    const result = computeRankingSummary(items);
    expect(result.total).toBe(4);
    expect(result.buyCount).toBe(2);
    expect(result.sellCount).toBe(1);
    expect(result.waitCount).toBe(1);
  });

  it('counts actionable as buy + sell (excludes wait and none)', () => {
    const items = [
      makeItem('BTCUSDT', TradeActionEnum.Buy, 80),
      makeItem('ETHUSDT', TradeActionEnum.Sell, 70),
      makeItem('SOLUSDT', TradeActionEnum.Wait, 50),
      makeItem('BNBUSDT', TradeActionEnum.None, 30),
    ];
    const result = computeRankingSummary(items);
    expect(result.actionable).toBe(2);
  });

  it('identifies best symbol by highest confidence', () => {
    const items = [
      makeItem('BTCUSDT', TradeActionEnum.Buy, 80),
      makeItem('ETHUSDT', TradeActionEnum.Sell, 90),
      makeItem('SOLUSDT', TradeActionEnum.Buy, 75),
    ];
    const result = computeRankingSummary(items);
    expect(result.bestConfidence).toBe(90);
    expect(result.bestSymbol).toBe('ETHUSDT');
  });

  it('returns null bestSymbol and bestConfidence for non-actionable-only list', () => {
    const items = [
      makeItem('BTCUSDT', TradeActionEnum.Wait, 50),
      makeItem('ETHUSDT', TradeActionEnum.None, 20),
    ];
    const result = computeRankingSummary(items);
    expect(result.bestConfidence).toBeNull();
    expect(result.bestSymbol).toBeNull();
  });
});
