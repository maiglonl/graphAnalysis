import { describe, expect, it } from 'vitest';
import { IntervalEnum } from '#shared/types/market';
import { HISTORICAL_SIMULATION } from '#shared/utils/detectors/constants';
import { runMultiWindowWalkForwardSimulation } from '../../../server/utils/multiWindowWalkForwardSimulation';
import { bullishTrendCandles, flatCandles } from '../../fixtures/candles/factories';

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

  it('returns walkForwardWindowCount windows when candles are sufficient', () => {
    const result = runMultiWindowWalkForwardSimulation({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      candles: bullishTrendCandles(180),
    });

    expect(result.windows.length).toBe(HISTORICAL_SIMULATION.walkForwardWindowCount);
  });

  it('returns 1 window when candles are below minimum window size', () => {
    const result = runMultiWindowWalkForwardSimulation({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      candles: flatCandles(60),
    });

    expect(result.windows.length).toBe(1);
    expect(result.summary.windows).toBe(1);
  });

  it('improved/reduced count is between 0 and windows.length', () => {
    const result = runMultiWindowWalkForwardSimulation({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      candles: bullishTrendCandles(180),
    });

    const { summary } = result;
    const n = result.windows.length;
    expect(summary.improvedWinRateWindows).toBeGreaterThanOrEqual(0);
    expect(summary.improvedWinRateWindows).toBeLessThanOrEqual(n);
    expect(summary.improvedReturnWindows).toBeGreaterThanOrEqual(0);
    expect(summary.improvedReturnWindows).toBeLessThanOrEqual(n);
    expect(summary.reducedDrawdownWindows).toBeGreaterThanOrEqual(0);
    expect(summary.reducedDrawdownWindows).toBeLessThanOrEqual(n);
  });

  it('respects windowCount override', () => {
    const result = runMultiWindowWalkForwardSimulation({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      candles: bullishTrendCandles(300),
      windowCount: 5,
    });

    expect(result.windows.length).toBe(5);
    expect(result.summary.windows).toBe(5);
  });

  it('clamps windowCount to maxWalkForwardWindowCount', () => {
    const result = runMultiWindowWalkForwardSimulation({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      candles: bullishTrendCandles(300),
      windowCount: 99,
    });

    expect(result.windows.length).toBe(HISTORICAL_SIMULATION.maxWalkForwardWindowCount);
  });

  it('returns zero summary deltas without error when there are no trades', () => {
    const result = runMultiWindowWalkForwardSimulation({
      symbol: 'BTCUSDT',
      interval: IntervalEnum.OneHour,
      candles: flatCandles(10),
    });

    expect(result.windows.length).toBeGreaterThan(0);
    expect(result.summary.totalTradesDelta).toBe(0);
    expect(result.summary.winRateDelta).toBe(0);
  });
});
