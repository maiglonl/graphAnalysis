import { TradeActionEnum } from "#shared/types/market";
import { ACTION_CLASSES } from "#shared/utils/colors";

export function getActionClass(action?: string): string {
  return ACTION_CLASSES[action as TradeActionEnum] ?? ACTION_CLASSES[TradeActionEnum.None];
}
