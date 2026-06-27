import { describe, expect, it } from 'vitest';
import { buildRiskPlan } from '#shared/utils/riskPlan';

describe('risk plan', () => {
  it('builds a risk plan from entry and stop', () => {
    expect(buildRiskPlan({
      accountSize: 10000,
      riskPercent: 1,
      entry: 100,
      stop: 90,
      targets: [120, 130],
    })).toEqual({
      accountSize: 10000,
      riskPercent: 1,
      riskAmount: 100,
      entry: 100,
      stop: 90,
      stopDistance: 10,
      positionSize: 1000,
      quantity: 10,
      riskRewardByTarget: [2, 3],
    });
  });

  it('returns null without valid entry and stop', () => {
    expect(buildRiskPlan({
      accountSize: 10000,
      riskPercent: 1,
    })).toBeNull();
  });
});
