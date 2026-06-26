import { PatternDirectionEnum, TradeActionEnum } from '#shared/types/market';

export const MARKET_COLORS = {
  bullish: '#16a34a',
  bearish: '#dc2626',
  neutral: '#64748b',
  stop: '#ef4444',
  target: '#2563eb',
} as const;

export const ACTION_CLASSES: Record<TradeActionEnum, string> = {
  [TradeActionEnum.Buy]: 'bg-green-100 text-green-800',
  [TradeActionEnum.Sell]: 'bg-red-100 text-red-800',
  [TradeActionEnum.Wait]: 'bg-yellow-100 text-yellow-800',
  [TradeActionEnum.None]: 'bg-slate-100 text-slate-700',
};

export function directionColor(direction: PatternDirectionEnum): string {
  switch (direction) {
    case PatternDirectionEnum.Bullish:
      return MARKET_COLORS.bullish;

    case PatternDirectionEnum.Bearish:
      return MARKET_COLORS.bearish;

    default:
      return MARKET_COLORS.neutral;
  }
}

export function actionColor(action: TradeActionEnum): string {
  switch (action) {
    case TradeActionEnum.Buy:
      return MARKET_COLORS.bullish;

    case TradeActionEnum.Sell:
      return MARKET_COLORS.bearish;

    default:
      return MARKET_COLORS.neutral;
  }
}
