import type { AnalyzeResponse } from '#shared/types/market';
import { TradeActionEnum } from '#shared/types/market';

export type RankingSummary = {
  total: number;
  actionable: number;
  buyCount: number;
  sellCount: number;
  waitCount: number;
  bestConfidence: number | null;
  bestSymbol: string | null;
};

export function computeRankingSummary(items: AnalyzeResponse[]): RankingSummary {
  if (items.length === 0) {
    return { total: 0, actionable: 0, buyCount: 0, sellCount: 0, waitCount: 0, bestConfidence: null, bestSymbol: null };
  }

  let buyCount = 0;
  let sellCount = 0;
  let waitCount = 0;
  let bestConfidence: number | null = null;
  let bestSymbol: string | null = null;

  for (const item of items) {
    const { action, confidence } = item.suggestion;
    if (action === TradeActionEnum.Buy) buyCount++;
    else if (action === TradeActionEnum.Sell) sellCount++;
    else if (action === TradeActionEnum.Wait) waitCount++;

    const isActionable = action === TradeActionEnum.Buy || action === TradeActionEnum.Sell;
    if (isActionable && (bestConfidence === null || confidence > bestConfidence)) {
      bestConfidence = confidence;
      bestSymbol = item.symbol;
    }
  }

  return {
    total: items.length,
    actionable: buyCount + sellCount,
    buyCount,
    sellCount,
    waitCount,
    bestConfidence,
    bestSymbol,
  };
}
