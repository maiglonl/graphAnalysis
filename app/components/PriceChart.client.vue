<script setup lang="ts">
import {
  CandlestickSeries,
  createChart,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type SeriesMarker,
  type UTCTimestamp,
} from "lightweight-charts";

import type { Candle, PatternSignal } from "#shared/types/market";

const props = defineProps<{
  candles: Candle[];
  patterns?: PatternSignal[];
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

  chart.timeScale().fitContent();
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
  () => [props.candles, props.patterns],
  () => renderChart(),
  { deep: true },
);
</script>

<template>
  <div ref="chartEl" class="w-full min-h-96" />
</template>
