<script setup lang="ts">
import {
  CandlestickSeries,
  LineStyle,
  createChart,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type SeriesMarker,
  type UTCTimestamp,
} from 'lightweight-charts';

import {
  PatternDirectionEnum,
  type TradeSuggestion,
  type Candle,
  type MarketStructure,
  type PatternSignal,
} from '#shared/types/market';
import { MARKET_COLORS, actionColor, directionColor } from '#shared/utils/colors';
import {
  ChartPriceLineKindEnum,
  buildFvgZones,
  buildPatternMarkers,
  buildPatternPriceLines,
  buildStructureBreakMarkers,
  buildStructureMarkers,
  buildTradePlanLines,
  type ChartPatternMarker,
  type ChartPriceLine,
  type ChartStructureBreakMarker,
  type ChartStructureMarker,
  type ChartZone,
} from '~/utils/chartAnnotations';

const { t } = useI18n();

const props = defineProps<{
  candles: Candle[];
  patterns?: PatternSignal[];
  structure?: MarketStructure;
  suggestion?: TradeSuggestion;
}>();

const chartEl = ref<HTMLDivElement | null>(null);
const renderedZones = ref<RenderedChartZone[]>([]);

let chart: IChartApi | null = null;
let candleSeries: ISeriesApi<'Candlestick'> | null = null;

function toChartTime(time: number): UTCTimestamp {
  return Math.floor(time / 1000) as UTCTimestamp;
}

type RenderedChartZone = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  backgroundColor: string;
  borderColor: string;
  label: string;
};

function toPatternSeriesMarker(marker: ChartPatternMarker): SeriesMarker<UTCTimestamp> {
  const isBullish = marker.direction === PatternDirectionEnum.Bullish;
  const isBearish = marker.direction === PatternDirectionEnum.Bearish;

  return {
    time: toChartTime(marker.time),
    position: isBullish ? 'belowBar' : 'aboveBar',
    shape: isBullish ? 'arrowUp' : isBearish ? 'arrowDown' : 'circle',
    color: directionColor(marker.direction),
    text: t(`patterns.${marker.patternId}.name`),
  };
}

function toStructureBreakSeriesMarker(marker: ChartStructureBreakMarker): SeriesMarker<UTCTimestamp> {
  return {
    time: toChartTime(marker.time),
    position: marker.position,
    shape: marker.shape,
    color: directionColor(marker.direction),
    text: t(`patterns.${marker.patternId}.name`),
  };
}

function toStructureSeriesMarker(marker: ChartStructureMarker): SeriesMarker<UTCTimestamp> {
  return {
    time: toChartTime(marker.time),
    position: marker.position,
    shape: marker.shape,
    color: directionColor(marker.direction),
    text: t(marker.labelKey),
  };
}

function colorWithAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getLineColor(line: ChartPriceLine): string {
  if (line.kind === ChartPriceLineKindEnum.Stop) return MARKET_COLORS.stop;
  if (line.kind === ChartPriceLineKindEnum.Target) return MARKET_COLORS.target;
  if (line.direction) return directionColor(line.direction);
  if (props.suggestion) return actionColor(props.suggestion.action);
  return MARKET_COLORS.neutral;
}

function getLineStyle(line: ChartPriceLine): LineStyle {
  if (line.kind === ChartPriceLineKindEnum.Entry) return LineStyle.Solid;
  if (line.kind === ChartPriceLineKindEnum.Stop) return LineStyle.Dashed;
  return LineStyle.Dotted;
}

function getLineWidth(line: ChartPriceLine): 1 | 2 | 3 | 4 {
  if (line.kind === ChartPriceLineKindEnum.Entry || line.kind === ChartPriceLineKindEnum.Stop) return 2;
  return 1;
}

function addPriceLine(line: ChartPriceLine) {
  if (!candleSeries) return;

  candleSeries.createPriceLine({
    price: line.price,
    color: getLineColor(line),
    lineWidth: getLineWidth(line),
    lineStyle: getLineStyle(line),
    axisLabelVisible: true,
    title: t(line.titleKey, line.titleParams ?? {}),
  });
}

function addChartAnnotations() {
  if (!candleSeries) return;

  const patternMarkers = buildPatternMarkers(props.candles, props.patterns ?? []);
  const structureBreakMarkers = buildStructureBreakMarkers(props.candles, props.patterns ?? []);
  const structureMarkers = buildStructureMarkers(props.candles, props.structure);

  createSeriesMarkers(candleSeries, [
    ...patternMarkers.map(toPatternSeriesMarker),
    ...structureBreakMarkers.map(toStructureBreakSeriesMarker),
    ...structureMarkers.map(toStructureSeriesMarker),
  ]);

  const tradePlanLines = buildTradePlanLines(props.suggestion);
  const patternPriceLines = buildPatternPriceLines(props.patterns ?? []);

  [...tradePlanLines, ...patternPriceLines].forEach(addPriceLine);
}

function toRenderedZone(zone: ChartZone): RenderedChartZone | null {
  if (!chart || !candleSeries) return null;

  const fromCoordinate = chart.timeScale().timeToCoordinate(toChartTime(zone.fromTime));
  const toCoordinate = chart.timeScale().timeToCoordinate(toChartTime(zone.toTime));
  const topCoordinate = candleSeries.priceToCoordinate(zone.top);
  const bottomCoordinate = candleSeries.priceToCoordinate(zone.bottom);

  if (fromCoordinate == null || toCoordinate == null || topCoordinate == null || bottomCoordinate == null) {
    return null;
  }

  const color = directionColor(zone.direction);
  const left = Math.min(fromCoordinate, toCoordinate);
  const right = Math.max(fromCoordinate, toCoordinate);
  const top = Math.min(topCoordinate, bottomCoordinate);
  const bottom = Math.max(topCoordinate, bottomCoordinate);

  return {
    id: zone.id,
    left,
    top,
    width: Math.max(6, right - left),
    height: Math.max(4, bottom - top),
    backgroundColor: colorWithAlpha(color, 0.12),
    borderColor: colorWithAlpha(color, 0.42),
    label: t('chart.fvgZone'),
  };
}

function updateRenderedZones() {
  const zones = buildFvgZones(props.candles, props.patterns ?? []);
  renderedZones.value = zones.map(toRenderedZone).filter(Boolean) as RenderedChartZone[];
}

function handleVisibleTimeRangeChange() {
  updateRenderedZones();
}

function cleanupChart() {
  if (!chart) return;

  chart.timeScale().unsubscribeVisibleTimeRangeChange(handleVisibleTimeRangeChange);
  chart.remove();
  chart = null;
  candleSeries = null;
  renderedZones.value = [];
}

function renderChart() {
  if (!chartEl.value || !props.candles.length) return;

  cleanupChart();

  chart = createChart(chartEl.value, {
    height: 420,
    layout: {
      background: { color: '#ffffff' },
      textColor: '#111827',
    },
    grid: {
      vertLines: { color: '#f1f5f9' },
      horzLines: { color: '#f1f5f9' },
    },
    rightPriceScale: {
      borderVisible: false,
    },
    timeScale: {
      borderVisible: false,
      timeVisible: true,
      secondsVisible: false,
    },
  });

  candleSeries = chart.addSeries(CandlestickSeries, {
    upColor: MARKET_COLORS.bullish,
    downColor: MARKET_COLORS.bearish,
    borderVisible: false,
    wickUpColor: MARKET_COLORS.bullish,
    wickDownColor: MARKET_COLORS.bearish,
    priceLineVisible: false,
    lastValueVisible: true,
  });

  candleSeries.setData(
    props.candles.map((candle) => ({
      time: toChartTime(candle.time),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }))
  );

  addChartAnnotations();

  chart.timeScale().subscribeVisibleTimeRangeChange(handleVisibleTimeRangeChange);
  chart.timeScale().fitContent();
  resizeChart();
  updateRenderedZones();
}

function resizeChart() {
  if (!chart || !chartEl.value) return;

  chart.applyOptions({
    width: chartEl.value.clientWidth,
  });

  updateRenderedZones();
}

onMounted(() => {
  renderChart();
  window.addEventListener('resize', resizeChart);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart);
  cleanupChart();
});

watch(
  () => [props.candles, props.patterns, props.structure, props.suggestion],
  () => renderChart(),
  { deep: true }
);
</script>

<template>
  <div class="relative w-full">
    <div ref="chartEl" class="flex w-full min-h-96" />

    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        v-for="zone in renderedZones"
        :key="zone.id"
        class="absolute rounded border text-xs font-semibold px-1 py-0.5"
        :style="{
          left: `${zone.left}px`,
          top: `${zone.top}px`,
          width: `${zone.width}px`,
          height: `${zone.height}px`,
          backgroundColor: zone.backgroundColor,
          borderColor: zone.borderColor,
        }"
      >
        <span class="text-slate-700">
          {{ zone.label }}
        </span>
      </div>
    </div>
  </div>
</template>
