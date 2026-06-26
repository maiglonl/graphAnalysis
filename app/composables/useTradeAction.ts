import { TradeActionEnum } from '#shared/types/market';
import { ACTION_CLASSES } from '#shared/utils/colors';

export function getActionClass(action?: TradeActionEnum): string {
  return ACTION_CLASSES[action ?? TradeActionEnum.None];
}
