import { describe, expect, it } from 'vitest';
import { IntervalEnum } from '#shared/types/market';
import { runMultiWindowWalkForwardSimulation } from '../../../server/utils/multiWindowWalkForwardSimulation';
import { bullishTrendCandles } from '../../fixtures/candles/factories';

describe('runMultiWindowWalkForwardSimulation', () => {
  it('returns multiple windows and aggregated comparison summary', () => {
    const result = runMultiWindowWalkForwardSimulation({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      candles: bullishTrendCandles(180),
    });

    expect(result.symbol).toBe('BTCUSDT');
    expect(result.windows.length).toBeGreaterThan(0);
    expect(result.summary.windows).toBe(result.windows.length);
    expect(result.summary).toEqual(expect.objectContaining({
      totalTradesDelta: expect.any(Number),
      winRateDelta: expect.any(Number),
      averageReturnDelta: expect.any(Number),
      maxDrawdownDelta: expect.any(Number),
      averageConfidenceDelta: expect.any(Number),
      improvedWinRateWindows: expect.any(Number),
      improvedReturnWindows: expect.any(Number),
      reducedDrawdownWindows: expect.any(Number),
    }));
  });
});
