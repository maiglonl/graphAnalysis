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

import type {
  Candle,
  PatternSignal,
  TradeSuggestion,
} from "#shared/types/market";

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
    const isBullish = pattern.direction === "bullish";
    const isBearish = pattern.direction === "bearish";

    return {
      time: toChartTime(last.time),
      position: isBullish ? "belowBar" : "aboveBar",
      shape: isBullish ? "arrowUp" : isBearish ? "arrowDown" : "circle",
      color: isBullish ? "#16a34a" : isBearish ? "#dc2626" : "#64748b",
      text: pattern.name,
    };
  });
}

function addTradePlanLines() {
  if (!candleSeries || !props.suggestion) return;

  const { entry, stop, targets, action } = props.suggestion;

  if (entry) {
    candleSeries.createPriceLine({
      price: entry,
      color: action === "sell" ? "#dc2626" : "#16a34a",
      lineWidth: 2,
      lineStyle: LineStyle.Solid,
      axisLabelVisible: true,
      title: "Entrada",
    });
  }

  if (stop) {
    candleSeries.createPriceLine({
      price: stop,
      color: "#ef4444",
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: "Stop",
    });
  }

  targets?.forEach((target, index) => {
    candleSeries?.createPriceLine({
      price: target,
      color: "#2563eb",
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      axisLabelVisible: true,
      title: `Alvo ${index + 1}`,
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
        color: "#ffffff",
      },
      textColor: "#111827",
    },
    grid: {
      vertLines: {
        color: "#f1f5f9",
      },
      horzLines: {
        color: "#f1f5f9",
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
    upColor: "#16a34a",
    downColor: "#dc2626",
    borderVisible: false,
    wickUpColor: "#16a34a",
    wickDownColor: "#dc2626",
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
