import {
  MarketStructurePointEnum,
  PatternDirectionEnum,
  PatternIdEnum,
  type Candle,
  type MarketStructure,
  type PatternSignal,
  type SwingPoint,
  type TradeSuggestion,
} from '#shared/types/market';

export enum ChartPriceLineKindEnum {
  Entry = 'entry',
  Stop = 'stop',
  Target = 'target',
  FvgBoundary = 'fvgBoundary',
  BrokenLevel = 'brokenLevel',
}

export enum ChartZoneKindEnum {
  FairValueGap = 'fairValueGap',
}

export type ChartMarkerPosition = 'aboveBar' | 'belowBar';
export type ChartMarkerShape = 'arrowUp' | 'arrowDown' | 'circle';

export type ChartPatternMarker = {
  id: string;
  time: number;
  direction: PatternDirectionEnum;
  patternId: PatternIdEnum;
};

export type ChartStructureBreakMarker = {
  id: string;
  time: number;
  direction: PatternDirectionEnum;
  patternId: PatternIdEnum;
  position: ChartMarkerPosition;
  shape: ChartMarkerShape;
};

export type ChartStructureMarker = {
  id: string;
  time: number;
  direction: PatternDirectionEnum;
  labelKey: string;
  position: ChartMarkerPosition;
  shape: ChartMarkerShape;
};

export type ChartPriceLine = {
  id: string;
  price: number;
  kind: ChartPriceLineKindEnum;
  titleKey: string;
  titleParams?: Record<string, unknown>;
  direction?: PatternDirectionEnum;
};

export type ChartZone = {
  id: string;
  fromTime: number;
  toTime: number;
  top: number;
  bottom: number;
  direction: PatternDirectionEnum;
  kind: ChartZoneKindEnum;
};

function getMetaNumber(pattern: PatternSignal, key: string): number | null {
  const value = pattern.meta?.[key];

  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function isFvgPattern(pattern: PatternSignal): boolean {
  return pattern.id === PatternIdEnum.BullishFvg || pattern.id === PatternIdEnum.BearishFvg;
}

function isStructureBreakPattern(pattern: PatternSignal): boolean {
  return (
    pattern.id === PatternIdEnum.BullishBos ||
    pattern.id === PatternIdEnum.BearishBos ||
    pattern.id === PatternIdEnum.BullishChoch ||
    pattern.id === PatternIdEnum.BearishChoch
  );
}

function isBullishStructureBreak(pattern: PatternSignal): boolean {
  return pattern.id === PatternIdEnum.BullishBos || pattern.id === PatternIdEnum.BullishChoch;
}

function isBearishStructureBreak(pattern: PatternSignal): boolean {
  return pattern.id === PatternIdEnum.BearishBos || pattern.id === PatternIdEnum.BearishChoch;
}

function isBosPattern(pattern: PatternSignal): boolean {
  return pattern.id === PatternIdEnum.BullishBos || pattern.id === PatternIdEnum.BearishBos;
}

export function buildPatternMarkers(candles: Candle[], patterns: PatternSignal[]): ChartPatternMarker[] {
  const last = candles.at(-1);

  if (!last) return [];

  return patterns
    .filter((pattern) => !isStructureBreakPattern(pattern))
    .map((pattern) => ({
      id: `${pattern.id}-${last.time}`,
      time: last.time,
      direction: pattern.direction,
      patternId: pattern.id,
    }));
}

export function buildStructureBreakMarkers(candles: Candle[], patterns: PatternSignal[]): ChartStructureBreakMarker[] {
  const last = candles.at(-1);

  if (!last) return [];

  return patterns
    .filter(isStructureBreakPattern)
    .filter((pattern) => shouldRenderStructureBreakMarker(pattern, patterns))
    .map((pattern) => {
      const isBullish = pattern.direction === PatternDirectionEnum.Bullish || isBullishStructureBreak(pattern);
      const time = getMetaNumber(pattern, 'time') ?? last.time;

      return {
        id: `structure-break-${pattern.id}-${time}`,
        time,
        direction: pattern.direction,
        patternId: pattern.id,
        position: isBullish ? 'belowBar' : 'aboveBar',
        shape: isBullish ? 'arrowUp' : 'arrowDown',
      };
    });
}

function shouldRenderStructureBreakMarker(pattern: PatternSignal, patterns: PatternSignal[]): boolean {
  if (!isBosPattern(pattern)) return true;

  if (isBullishStructureBreak(pattern)) {
    return !patterns.some((candidate) => candidate.id === PatternIdEnum.BullishChoch);
  }

  if (isBearishStructureBreak(pattern)) {
    return !patterns.some((candidate) => candidate.id === PatternIdEnum.BearishChoch);
  }

  return true;
}

export function buildStructureMarkers(candles: Candle[], structure?: MarketStructure): ChartStructureMarker[] {
  if (!structure) return [];

  return [
    buildPreviousHighMarker(candles, structure.previousHigh),
    buildPreviousLowMarker(candles, structure.previousLow),
    buildLastHighMarker(candles, structure),
    buildLastLowMarker(candles, structure),
  ].filter(Boolean) as ChartStructureMarker[];
}

function buildPreviousHighMarker(candles: Candle[], point: SwingPoint | null): ChartStructureMarker | null {
  return buildStructureMarker(candles, point, {
    direction: PatternDirectionEnum.Neutral,
    labelKey: 'chart.swingHigh',
    position: 'aboveBar',
    shape: 'circle',
  });
}

function buildPreviousLowMarker(candles: Candle[], point: SwingPoint | null): ChartStructureMarker | null {
  return buildStructureMarker(candles, point, {
    direction: PatternDirectionEnum.Neutral,
    labelKey: 'chart.swingLow',
    position: 'belowBar',
    shape: 'circle',
  });
}

function buildLastHighMarker(candles: Candle[], structure: MarketStructure): ChartStructureMarker | null {
  const isHigherHigh = structure.points.includes(MarketStructurePointEnum.HigherHigh);
  const isLowerHigh = structure.points.includes(MarketStructurePointEnum.LowerHigh);

  if (isHigherHigh) {
    return buildStructureMarker(candles, structure.lastHigh, {
      direction: PatternDirectionEnum.Bullish,
      labelKey: 'chart.higherHigh',
      position: 'aboveBar',
      shape: 'arrowDown',
    });
  }

  if (isLowerHigh) {
    return buildStructureMarker(candles, structure.lastHigh, {
      direction: PatternDirectionEnum.Bearish,
      labelKey: 'chart.lowerHigh',
      position: 'aboveBar',
      shape: 'arrowDown',
    });
  }

  return buildPreviousHighMarker(candles, structure.lastHigh);
}

function buildLastLowMarker(candles: Candle[], structure: MarketStructure): ChartStructureMarker | null {
  const isHigherLow = structure.points.includes(MarketStructurePointEnum.HigherLow);
  const isLowerLow = structure.points.includes(MarketStructurePointEnum.LowerLow);

  if (isHigherLow) {
    return buildStructureMarker(candles, structure.lastLow, {
      direction: PatternDirectionEnum.Bullish,
      labelKey: 'chart.higherLow',
      position: 'belowBar',
      shape: 'arrowUp',
    });
  }

  if (isLowerLow) {
    return buildStructureMarker(candles, structure.lastLow, {
      direction: PatternDirectionEnum.Bearish,
      labelKey: 'chart.lowerLow',
      position: 'belowBar',
      shape: 'arrowUp',
    });
  }

  return buildPreviousLowMarker(candles, structure.lastLow);
}

function buildStructureMarker(
  candles: Candle[],
  point: SwingPoint | null,
  marker: Omit<ChartStructureMarker, 'id' | 'time'>,
): ChartStructureMarker | null {
  if (!point) return null;

  const candle = candles[point.index];
  if (!candle) return null;

  return {
    id: `${marker.labelKey}-${point.index}`,
    time: candle.time,
    ...marker,
  };
}

export function buildTradePlanLines(suggestion?: TradeSuggestion): ChartPriceLine[] {
  if (!suggestion) return [];

  const lines: ChartPriceLine[] = [];

  if (suggestion.entry != null) {
    lines.push({
      id: 'trade-entry',
      price: suggestion.entry,
      kind: ChartPriceLineKindEnum.Entry,
      titleKey: 'common.entry',
    });
  }

  if (suggestion.stop != null) {
    lines.push({
      id: 'trade-stop',
      price: suggestion.stop,
      kind: ChartPriceLineKindEnum.Stop,
      titleKey: 'common.stop',
    });
  }

  suggestion.targets?.forEach((target, index) => {
    lines.push({
      id: `trade-target-${index + 1}`,
      price: target,
      kind: ChartPriceLineKindEnum.Target,
      titleKey: 'chart.targetLine',
      titleParams: {
        n: index + 1,
      },
    });
  });

  return lines;
}

export function buildPatternPriceLines(patterns: PatternSignal[]): ChartPriceLine[] {
  const lines: ChartPriceLine[] = [];

  patterns.forEach((pattern) => {
    if (isFvgPattern(pattern)) {
      const gapStart = getMetaNumber(pattern, 'gapStart');
      const gapEnd = getMetaNumber(pattern, 'gapEnd');

      if (gapStart != null) {
        lines.push({
          id: `${pattern.id}-gap-start`,
          price: gapStart,
          kind: ChartPriceLineKindEnum.FvgBoundary,
          titleKey: 'chart.fvgStart',
          direction: pattern.direction,
        });
      }

      if (gapEnd != null) {
        lines.push({
          id: `${pattern.id}-gap-end`,
          price: gapEnd,
          kind: ChartPriceLineKindEnum.FvgBoundary,
          titleKey: 'chart.fvgEnd',
          direction: pattern.direction,
        });
      }
    }

    if (isStructureBreakPattern(pattern)) {
      const brokenLevel = getMetaNumber(pattern, 'brokenLevel');

      if (brokenLevel != null) {
        lines.push({
          id: `${pattern.id}-broken-level`,
          price: brokenLevel,
          kind: ChartPriceLineKindEnum.BrokenLevel,
          titleKey: 'chart.brokenLevel',
          direction: pattern.direction,
        });
      }
    }
  });

  return dedupePriceLines(lines);
}

export function buildFvgZones(candles: Candle[], patterns: PatternSignal[]): ChartZone[] {
  const last = candles.at(-1);

  if (!last) return [];

  return patterns.flatMap((pattern) => {
    if (!isFvgPattern(pattern)) return [];

    const gapStart = getMetaNumber(pattern, 'gapStart');
    const gapEnd = getMetaNumber(pattern, 'gapEnd');
    const fromTime = getMetaNumber(pattern, 'fromTime');
    const toTime = getMetaNumber(pattern, 'toTime') ?? last.time;

    if (gapStart == null || gapEnd == null || fromTime == null) return [];

    return [
      {
        id: `${pattern.id}-zone-${fromTime}`,
        fromTime,
        toTime: Math.max(toTime, last.time),
        top: Math.max(gapStart, gapEnd),
        bottom: Math.min(gapStart, gapEnd),
        direction: pattern.direction,
        kind: ChartZoneKindEnum.FairValueGap,
      },
    ];
  });
}

function dedupePriceLines(lines: ChartPriceLine[]): ChartPriceLine[] {
  const seen = new Set<string>();

  return lines.filter((line) => {
    const key = `${line.kind}-${line.price}-${line.direction ?? 'none'}`;

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}
