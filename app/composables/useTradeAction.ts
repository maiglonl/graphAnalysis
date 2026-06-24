import { TradeActionEnum } from '#shared/types/market'

export function getActionClass(action?: string): string {
  switch (action) {
    case TradeActionEnum.Buy:  return 'bg-green-100 text-green-800'
    case TradeActionEnum.Sell: return 'bg-red-100 text-red-800'
    case TradeActionEnum.Wait: return 'bg-yellow-100 text-yellow-800'
    default:                   return 'bg-slate-100 text-slate-700'
  }
}
