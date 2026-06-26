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

import { PatternDirectionEnum, type TradeSuggestion, type Candle, type PatternSignal } from '#shared/types/market';
import { MARKET_COLORS, actionColor, directionColor } from '#shared/utils/colors';
import {
  ChartPriceLineKindEnum,
  buildPatternMarkers,
  buildPatternPriceLines,
  buildTradePlanLines,
  type ChartPatternMarker,
  type ChartPriceLine,
} from '~/utils/chartAnnotations';

const { t } = useI18n();

const props = defineProps<{
  candles: Candle[];
  patterns?: PatternSignal[];
  suggestion?: TradeSuggestion;
}>();

const chartEl = ref<HTMLDivElement | null>(null);

let chart: IChartApi | null = null;
let candleSeries: ISeriesApi<'Candlestick'> | null = null;

function toChartTime(time: number): UTCTimestamp {
  return Math.floor(time / 1000) as UTCTimestamp;
}

function toSeriesMarker(marker: ChartPatternMarker): SeriesMarker<UTCTimestamp> {
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

function getLineColor(line: ChartPriceLine): string {
  if (line.kind === ChartPriceLineKindEnum.Stop) {
    return MARKET_COLORS.stop;
  }

  if (line.kind === ChartPriceLineKindEnum.Target) {
    return MARKET_COLORS.target;
  }

  if (line.direction) {
    return directionColor(line.direction);
  }

  if (props.suggestion) {
    return actionColor(props.suggestion.action);
  }

  return MARKET_COLORS.neutral;
}

function getLineStyle(line: ChartPriceLine): LineStyle {
  if (line.kind === ChartPriceLineKindEnum.Entry) {
    return LineStyle.Solid;
  }

  if (line.kind === ChartPriceLineKindEnum.Stop) {
    return LineStyle.Dashed;
  }

  return LineStyle.Dotted;
}

function getLineWidth(line: ChartPriceLine): 1 | 2 | 3 | 4 {
  if (line.kind === ChartPriceLineKindEnum.Entry || line.kind === ChartPriceLineKindEnum.Stop) {
    return 2;
  }

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

  createSeriesMarkers(candleSeries, patternMarkers.map(toSeriesMarker));

  const tradePlanLines = buildTradePlanLines(props.suggestion);
  const patternPriceLines = buildPatternPriceLines(props.patterns ?? []);

  [...tradePlanLines, ...patternPriceLines].forEach(addPriceLine);
}

function renderChart() {
  if (!chartEl.value || !props.candles.length) return;

  chart?.remove();

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
  window.addEventListener('resize', resizeChart);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart);
  chart?.remove();
});

watch(
  () => [props.candles, props.patterns, props.suggestion],
  () => renderChart(),
  { deep: true }
);
</script>

<template>
  <div ref="chartEl" class="flex w-full min-h-96" />
</template>
