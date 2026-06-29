import { describe, expect, it } from 'vitest';
import { HISTORICAL_SIMULATION, SCANNER } from '#shared/utils/detectors/constants';
import { buildHistoricalSimulationWindow } from '../../../server/utils/historicalSimulationWindow';

describe('buildHistoricalSimulationWindow', () => {
  it('splits 200 candles into 60% train and 40% validation', () => {
    const window = buildHistoricalSimulationWindow(200);

    expect(window.trainStartIndex).toBe(0);
    expect(window.trainCandles).toBe(120);
    expect(window.validationStartIndex).toBe(120);
    expect(window.trainEndIndex).toBe(119);
    expect(window.validationCandles).toBe(80);
    expect(window.validationEndIndex).toBe(175);
  });

  it('caps validation start so at least minValidationCandles are available', () => {
    // 100 candles: splitIndex=60, but totalCandles-minValidation=50 → clamp to 50
    const window = buildHistoricalSimulationWindow(100);

    expect(window.validationStartIndex).toBe(50);
    expect(window.validationCandles).toBe(50);
    expect(window.trainCandles).toBe(50);
    expect(window.trainEndIndex).toBe(49);
  });

  it('validationEndIndex accounts for lookahead candles', () => {
    const window = buildHistoricalSimulationWindow(200);
    const expectedEnd = 200 - HISTORICAL_SIMULATION.maxLookaheadCandles - 1;

    expect(window.validationEndIndex).toBe(expectedEnd);
  });

  it('trainEndIndex is always validationStartIndex - 1', () => {
    const window = buildHistoricalSimulationWindow(140);

    expect(window.trainEndIndex).toBe(window.validationStartIndex - 1);
  });

  it('trainCandles equals validationStartIndex', () => {
    for (const totalCandles of [100, 140, 200, 500]) {
      const window = buildHistoricalSimulationWindow(totalCandles);
      expect(window.trainCandles).toBe(window.validationStartIndex);
    }
  });

  it('returns zero validationCandles when total is below minCandles', () => {
    const window = buildHistoricalSimulationWindow(10);

    expect(window.validationCandles).toBe(0);
    expect(window.validationStartIndex).toBe(SCANNER.minCandles);
  });
});
