import {
  PatternDirectionEnum,
  PatternIdEnum,
  type Candle,
  type PatternSignal,
  type TradeSuggestion,
} from '#shared/types/market';

export enum ChartPriceLineKindEnum {
  Entry = 'entry',
  Stop = 'stop',
  Target = 'target',
  FvgBoundary = 'fvgBoundary',
  BrokenLevel = 'brokenLevel',
}

export type ChartPatternMarker = {
  id: string;
  time: number;
  direction: PatternDirectionEnum;
  patternId: PatternIdEnum;
};

export type ChartPriceLine = {
  id: string;
  price: number;
  kind: ChartPriceLineKindEnum;
  titleKey: string;
  titleParams?: Record<string, unknown>;
  direction?: PatternDirectionEnum;
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

export function buildPatternMarkers(candles: Candle[], patterns: PatternSignal[]): ChartPatternMarker[] {
  const last = candles.at(-1);

  if (!last) return [];

  return patterns.map((pattern) => ({
    id: `${pattern.id}-${last.time}`,
    time: last.time,
    direction: pattern.direction,
    patternId: pattern.id,
  }));
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

function dedupePriceLines(lines: ChartPriceLine[]): ChartPriceLine[] {
  const seen = new Set<string>();

  return lines.filter((line) => {
    const key = `${line.kind}-${line.price}-${line.direction ?? 'none'}`;

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}
