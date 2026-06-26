import { describe, expect, it } from 'vitest';
import { calculateTargets, candleParts, round } from '#shared/utils/detectors/helpers';

const bullishCandle = {
  time: 1,
  open: 100,
  high: 115,
  low: 95,
  close: 110,
  volume: 1000,
};

describe('detector helpers', () => {
  it('rounds values with default precision', () => {
    expect(round(10.126)).toBe(10.13);
  });

  it('extracts candle parts', () => {
    expect(candleParts(bullishCandle)).toEqual({
      range: 20,
      body: 10,
      upperShadow: 5,
      lowerShadow: 5,
      bodyPct: 0.5,
      isBullish: true,
      isBearish: false,
      closePosition: 0.75,
    });
  });

  it('calculates upside targets', () => {
    expect(calculateTargets(100, 10, 'up')).toEqual([120, 130]);
  });

  it('calculates downside targets', () => {
    expect(calculateTargets(100, 10, 'down')).toEqual([80, 70]);
  });
});
