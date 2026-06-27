import { describe, expect, it } from 'vitest';
import {
  MarketStructurePointEnum,
  PatternDirectionEnum,
  PatternIdEnum,
  StructureTrendEnum,
  SwingPointTypeEnum,
  TradeActionEnum,
  type Candle,
  type MarketStructure,
  type PatternSignal,
} from '#shared/types/market';
import {
  buildFvgZones,
  buildPatternMarkers,
  buildPatternPriceLines,
  buildStructureBreakMarkers,
  buildStructureMarkers,
  buildTradePlanLines,
  ChartPriceLineKindEnum,
  ChartZoneKindEnum,
} from '~/utils/chartAnnotations';

const candles: Candle[] = [
  { time: 1000, open: 100, high: 105, low: 95, close: 100, volume: 1000 },
  { time: 2000, open: 101, high: 106, low: 96, close: 102, volume: 1000 },
];

function pattern(overrides: Partial<PatternSignal>): PatternSignal {
  return {
    id: PatternIdEnum.Hammer,
    direction: PatternDirectionEnum.Bullish,
    confidence: 60,
    ...overrides,
  };
}

function marketStructure(overrides: Partial<MarketStructure> = {}): MarketStructure {
  return {
    previousHigh: { index: 0, price: 105, type: SwingPointTypeEnum.High },
    previousLow: { index: 0, price: 95, type: SwingPointTypeEnum.Low },
    lastHigh: { index: 1, price: 106, type: SwingPointTypeEnum.High },
    lastLow: { index: 1, price: 96, type: SwingPointTypeEnum.Low },
    points: [],
    trend: StructureTrendEnum.Neutral,
    ...overrides,
  };
}

describe('chart annotations', () => {
  it('builds pattern markers and filters structure breaks', () => {
    const markers = buildPatternMarkers(candles, [
      pattern({ id: PatternIdEnum.Hammer }),
      pattern({ id: PatternIdEnum.BullishBos }),
    ]);

    expect(markers).toEqual([
      {
        id: 'hammer-2000',
        time: 2000,
        direction: PatternDirectionEnum.Bullish,
        patternId: PatternIdEnum.Hammer,
      },
    ]);
  });

  it('deduplicates BOS marker when CHOCH marker exists in same direction', () => {
    const markers = buildStructureBreakMarkers(candles, [
      pattern({ id: PatternIdEnum.BullishBos, meta: { time: 1500 } }),
      pattern({ id: PatternIdEnum.BullishChoch, meta: { time: 1600 } }),
    ]);

    expect(markers).toHaveLength(1);
    expect(markers[0]).toMatchObject({
      id: 'structure-break-bullishChoch-1600',
      time: 1600,
      position: 'belowBar',
      shape: 'arrowUp',
    });
  });

  it('builds market structure markers with HH and HL labels', () => {
    const markers = buildStructureMarkers(candles, marketStructure({
      points: [MarketStructurePointEnum.HigherHigh, MarketStructurePointEnum.HigherLow],
      trend: StructureTrendEnum.Bullish,
    }));

    expect(markers.map((marker) => marker.labelKey)).toEqual([
      'chart.swingHigh',
      'chart.swingLow',
      'chart.higherHigh',
      'chart.higherLow',
    ]);
    expect(markers.map((marker) => marker.time)).toEqual([1000, 1000, 2000, 2000]);
  });

  it('ignores structure points outside the candle range', () => {
    const markers = buildStructureMarkers(candles, marketStructure({
      previousHigh: { index: 10, price: 120, type: SwingPointTypeEnum.High },
      previousLow: null,
      lastHigh: null,
      lastLow: null,
    }));

    expect(markers).toEqual([]);
  });

  it('builds trade plan lines', () => {
    const lines = buildTradePlanLines({
      action: TradeActionEnum.Buy,
      confidence: 70,
      entry: 100,
      stop: 90,
      targets: [120, 130],
      reasons: [],
      scoreBreakdown: {
        patternScore: 70,
        structureScore: 0,
        trendScore: 0,
        volumeScore: 0,
        confluenceBonus: 0,
        conflictPenalty: 0,
      },
    });

    expect(lines.map((line) => line.kind)).toEqual([
      ChartPriceLineKindEnum.Entry,
      ChartPriceLineKindEnum.Stop,
      ChartPriceLineKindEnum.Target,
      ChartPriceLineKindEnum.Target,
    ]);
  });

  it('builds FVG and broken level price lines with deduplication', () => {
    const lines = buildPatternPriceLines([
      pattern({
        id: PatternIdEnum.BullishFvg,
        meta: {
          gapStart: 101,
          gapEnd: 104,
        },
      }),
      pattern({
        id: PatternIdEnum.BullishFvg,
        meta: {
          gapStart: 101,
          gapEnd: 104,
        },
      }),
      pattern({
        id: PatternIdEnum.BullishBos,
        meta: {
          brokenLevel: 110,
        },
      }),
    ]);

    expect(lines.map((line) => line.kind)).toEqual([
      ChartPriceLineKindEnum.FvgBoundary,
      ChartPriceLineKindEnum.FvgBoundary,
      ChartPriceLineKindEnum.BrokenLevel,
    ]);
    expect(lines.map((line) => line.price)).toEqual([101, 104, 110]);
  });

  it('builds FVG zones from pattern metadata', () => {
    const zones = buildFvgZones(candles, [
      pattern({
        id: PatternIdEnum.BullishFvg,
        meta: {
          gapStart: 101,
          gapEnd: 104,
          fromTime: 1000,
          toTime: 1500,
        },
      }),
    ]);

    expect(zones).toEqual([
      {
        id: 'bullishFvg-zone-1000',
        fromTime: 1000,
        toTime: 2000,
        top: 104,
        bottom: 101,
        direction: PatternDirectionEnum.Bullish,
        kind: ChartZoneKindEnum.FairValueGap,
      },
    ]);
  });
});
