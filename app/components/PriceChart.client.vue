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
} from "lightweight-charts";

import {
  PatternDirectionEnum,
  type TradeSuggestion,
  type Candle,
  type PatternSignal,
} from "#shared/types/market";
import { CHART_COLORS, directionColor, actionColor } from "#shared/utils/colors";

const { t } = useI18n();

const props = defineProps<{
  candles: Candle[];
  patterns?: PatternSignal[];
  suggestion?: TradeSuggestion;
}>();

const chartEl = ref<HTMLDivElement | null>(null);

let chart: IChartApi | null = null;
let candleSeries: ISeriesApi<"Candlestick"> | null = null;

function toChartTime(time: number): UTCTimestamp {
  return Math.floor(time / 1000) as UTCTimestamp;
}

function buildMarkers(): SeriesMarker<UTCTimestamp>[] {
  if (!props.patterns?.length || !props.candles.length) return [];

  const last = props.candles.at(-1);
  if (!last) return [];

  return props.patterns.map((pattern) => {
    const isBullish = pattern.direction === PatternDirectionEnum.Bullish;
    const isBearish = pattern.direction === PatternDirectionEnum.Bearish;

    return {
      time: toChartTime(last.time),
      position: isBullish ? "belowBar" : "aboveBar",
      shape: isBullish ? "arrowUp" : isBearish ? "arrowDown" : "circle",
      color: directionColor(pattern.direction),
      text: t(`patterns.${pattern.id}.name`),
    };
  });
}

function addTradePlanLines() {
  if (!candleSeries || !props.suggestion) return;

  const { entry, stop, targets, action } = props.suggestion;

  if (entry) {
    candleSeries.createPriceLine({
      price: entry,
      color: actionColor(action),
      lineWidth: 2,
      lineStyle: LineStyle.Solid,
      axisLabelVisible: true,
      title: t("common.entry"),
    });
  }

  if (stop) {
    candleSeries.createPriceLine({
      price: stop,
      color: CHART_COLORS.stop,
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: t("common.stop"),
    });
  }

  targets?.forEach((target, index) => {
    candleSeries?.createPriceLine({
      price: target,
      color: CHART_COLORS.target,
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      axisLabelVisible: true,
      title: t("chart.targetLine", { n: index + 1 }),
    });
  });
}

function renderChart() {
  if (!chartEl.value || !props.candles.length) return;

  chart?.remove();

  chart = createChart(chartEl.value, {
    height: 420,
    layout: {
      background: {
        color: CHART_COLORS.background,
      },
      textColor: CHART_COLORS.text,
    },
    grid: {
      vertLines: {
        color: CHART_COLORS.grid,
      },
      horzLines: {
        color: CHART_COLORS.grid,
      },
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
    upColor: CHART_COLORS.bullish,
    downColor: CHART_COLORS.bearish,
    borderVisible: false,
    wickUpColor: CHART_COLORS.bullish,
    wickDownColor: CHART_COLORS.bearish,
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
    })),
  );

  createSeriesMarkers(candleSeries, buildMarkers());
  addTradePlanLines();

  chart.timeScale().fitContent();
  resizeChart();
}

function resizeChart() {
  if (!chart || !chartEl.value) return;

  chart.applyOptions({
    width: chartEl.value.clientWidth,
  });
}

onMounted(() => {
  renderChart();
  window.addEventListener("resize", resizeChart);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
  chart?.remove();
});

watch(
  () => [props.candles, props.patterns, props.suggestion],
  () => renderChart(),
  { deep: true },
);
</script>

<template>
  <div ref="chartEl" class="flex w-full min-h-96" />
</template>
