import type { RiskPlan } from '#shared/types/market';

const PERCENT_DIVISOR = 100;
const DEFAULT_DECIMALS = 2;
const QUANTITY_DECIMALS = 8;

export type BuildRiskPlanParams = {
  accountSize: number;
  riskPercent: number;
  entry?: number;
  stop?: number;
  targets?: number[];
};

export function buildRiskPlan(params: BuildRiskPlanParams): RiskPlan | null {
  if (!isPositiveNumber(params.accountSize)) return null;
  if (!isPositiveNumber(params.riskPercent)) return null;
  if (!isPositiveNumber(params.entry)) return null;
  if (!isPositiveNumber(params.stop)) return null;

  const entry = params.entry;
  const stop = params.stop;
  const stopDistance = Math.abs(entry - stop);
  if (stopDistance === 0) return null;

  const riskAmount = params.accountSize * (params.riskPercent / PERCENT_DIVISOR);
  const quantity = riskAmount / stopDistance;
  const positionSize = quantity * entry;

  return {
    accountSize: round(params.accountSize),
    riskPercent: round(params.riskPercent),
    riskAmount: round(riskAmount),
    entry: round(entry),
    stop: round(stop),
    stopDistance: round(stopDistance),
    positionSize: round(positionSize),
    quantity: round(quantity, QUANTITY_DECIMALS),
    riskRewardByTarget: (params.targets ?? []).map((target) => round(Math.abs(target - entry) / stopDistance)),
  };
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function round(value: number, decimals = DEFAULT_DECIMALS): number {
  return Number(value.toFixed(decimals));
}
