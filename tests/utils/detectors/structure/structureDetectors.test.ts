import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MarketStructurePointEnum,
  PatternDirectionEnum,
  PatternIdEnum,
  StructureTrendEnum,
  SwingPointTypeEnum,
  type Candle,
  type MarketStructure,
} from '#shared/types/market';

const marketStructureMocks = vi.hoisted(() => ({
  getMarketStructure: vi.fn(),
}));

vi.mock('#shared/utils/marketStructure', () => marketStructureMocks);

import { BosDetector } from '#shared/utils/detectors/structure/bos';
import { ChochDetector } from '#shared/utils/detectors/structure/choch';
import { MarketStructureDetector } from '#shared/utils/detectors/structure/marketStructure';
import { ScanContext } from '#shared/utils/scanContext';

function candlesWithClose(close: number): Candle[] {
  return Array.from({ length: 60 }, (_, index) => ({
    time: index + 1,
    open: close,
    high: close + 1,
    low: close - 1,
    close,
    volume: 1000,
  }));
}

function structure(overrides: Partial<MarketStructure> = {}): MarketStructure {
  return {
    previousHigh: null,
    previousLow: null,
    lastHigh: { index: 20, price: 110, type: SwingPointTypeEnum.High },
    lastLow: { index: 30, price: 90, type: SwingPointTypeEnum.Low },
    points: [],
    trend: StructureTrendEnum.Neutral,
    ...overrides,
  };
}

describe('structure detectors', () => {
  beforeEach(() => {
    marketStructureMocks.getMarketStructure.mockReset();
  });

  it('maps market structure points to pattern signals', () => {
    marketStructureMocks.getMarketStructure.mockReturnValue(structure({
      points: [MarketStructurePointEnum.HigherHigh, MarketStructurePointEnum.LowerLow],
    }));

    const signals = new MarketStructureDetector().detect(new ScanContext(candlesWithClose(100)));

    expect(signals.map((signal) => signal.id)).toEqual([
      PatternIdEnum.HigherHigh,
      PatternIdEnum.LowerLow,
    ]);
    expect(signals.map((signal) => signal.direction)).toEqual([
      PatternDirectionEnum.Bullish,
      PatternDirectionEnum.Bearish,
    ]);
  });

  it('detects bullish BOS above the last high', () => {
    marketStructureMocks.getMarketStructure.mockReturnValue(structure());

    const signals = new BosDetector().detect(new ScanContext(candlesWithClose(120)));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.BullishBos,
      direction: PatternDirectionEnum.Bullish,
      entry: 120,
      stop: 90,
      meta: {
        brokenLevel: 110,
      },
    });
  });

  it('detects bearish BOS below the last low', () => {
    marketStructureMocks.getMarketStructure.mockReturnValue(structure());

    const signals = new BosDetector().detect(new ScanContext(candlesWithClose(80)));

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      id: PatternIdEnum.BearishBos,
      direction: PatternDirectionEnum.Bearish,
      entry: 80,
      stop: 110,
      meta: {
        brokenLevel: 90,
      },
    });
  });

  it('detects bullish CHOCH only against bearish structure trend', () => {
    marketStructureMocks.getMarketStructure.mockReturnValue(structure({
      trend: StructureTrendEnum.Bearish,
    }));

    const signals = new ChochDetector().detect(new ScanContext(candlesWithClose(120)));

    expect(signals[0]?.id).toBe(PatternIdEnum.BullishChoch);
  });

  it('ignores bullish CHOCH when structure trend is not bearish', () => {
    marketStructureMocks.getMarketStructure.mockReturnValue(structure({
      trend: StructureTrendEnum.Bullish,
    }));

    const signals = new ChochDetector().detect(new ScanContext(candlesWithClose(120)));

    expect(signals).toEqual([]);
  });
});
