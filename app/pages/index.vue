<script setup lang="ts">
import type {
  AnalyzeResponse,
  HistoricalSimulationResult,
  MultiTimeframeResponse,
  ScanListResponse,
} from '#shared/types/market';
import { DEFAULT_INTERVAL, DEFAULT_SYMBOL, IntervalEnum, TradeActionEnum } from '#shared/types/market';
import { resolveApiErrorMessage } from '~/utils/apiErrors';

type OpportunityActionFilter = TradeActionEnum | 'all';

const { t } = useI18n();

const symbol = usePersistedRef('graphAnalysis.symbol', DEFAULT_SYMBOL);
const interval = usePersistedRef<IntervalEnum>('graphAnalysis.interval', DEFAULT_INTERVAL);
const intervals = Object.values(IntervalEnum) as IntervalEnum[];
const symbolsToScan = usePersistedRef('graphAnalysis.symbolsToScan', 'BTCUSDT,ETHUSDT,SOLUSDT,BNBUSDT,XRPUSDT');
const actionFilter = usePersistedRef<OpportunityActionFilter>('graphAnalysis.actionFilter', 'all');
const minConfidence = usePersistedRef('graphAnalysis.minConfidence', 0);
const actionFilters = ['all', ...Object.values(TradeActionEnum)] as OpportunityActionFilter[];

const result = ref<AnalyzeResponse | null>(null);
const scanResult = ref<ScanListResponse | null>(null);
const historicalSimulation = ref<HistoricalSimulationResult | null>(null);
const timeframeSummary = ref<MultiTimeframeResponse | null>(null);
const loading = ref(false);
const scanLoading = ref(false);
const simulationLoading = ref(false);
const timeframeLoading = ref(false);
const error = ref('');

const scanItems = computed(() => scanResult.value?.items ?? []);

async function analyze() {
  loading.value = true;
  error.value = '';

  try {
    result.value = await $fetch<AnalyzeResponse>('/api/analyze', {
      query: {
        symbol: symbol.value,
        interval: interval.value,
      },
    });
    historicalSimulation.value = null;
    timeframeSummary.value = null;
  } catch (err: unknown) {
    error.value = resolveApiErrorMessage(err, t);
  } finally {
    loading.value = false;
  }
}

async function scanSymbols() {
  scanLoading.value = true;
  error.value = '';

  try {
    scanResult.value = await $fetch<ScanListResponse>('/api/scan', {
      query: {
        symbols: symbolsToScan.value,
        interval: interval.value,
      },
    });
  } catch (err: unknown) {
    error.value = resolveApiErrorMessage(err, t);
  } finally {
    scanLoading.value = false;
  }
}

async function runSimulation() {
  simulationLoading.value = true;
  error.value = '';

  try {
    historicalSimulation.value = await $fetch<HistoricalSimulationResult>('/api/historical-simulation', {
      query: {
        symbol: symbol.value,
        interval: interval.value,
      },
    });
  } catch (err: unknown) {
    error.value = resolveApiErrorMessage(err, t);
  } finally {
    simulationLoading.value = false;
  }
}

async function loadTimeframeSummary() {
  timeframeLoading.value = true;
  error.value = '';

  try {
    timeframeSummary.value = await $fetch<MultiTimeframeResponse>('/api/timeframe-summary', {
      query: {
        symbol: symbol.value,
      },
    });
  } catch (err: unknown) {
    error.value = resolveApiErrorMessage(err, t);
  } finally {
    timeframeLoading.value = false;
  }
}

function selectOpportunity(item: AnalyzeResponse) {
  symbol.value = item.symbol;
  interval.value = item.interval;
  result.value = item;
  historicalSimulation.value = null;
  timeframeSummary.value = null;
}

function selectTimeframeItem(item: AnalyzeResponse) {
  interval.value = item.interval;
  result.value = item;
  historicalSimulation.value = null;
}

onMounted(() => {
  analyze();
  scanSymbols();
});
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-900 p-8 max-md:p-4">
    <section class="max-w-6xl mx-auto">
      <header class="mb-6 flex justify-between items-start gap-4 max-md:flex-col">
        <div>
          <h1 class="text-4xl m-0">
            {{ $t('scanner.title') }}
          </h1>

          <p class="text-slate-500 mt-2">
            {{ $t('scanner.subtitle') }}
          </p>
        </div>

        <LocaleSwitcher />
      </header>

      <AnalysisForm
        v-model:symbol="symbol"
        v-model:interval="interval"
        :loading="loading"
        :intervals="intervals"
        @analyze="analyze"
      />

      <OpportunityRanking
        v-model:symbols="symbolsToScan"
        v-model:action-filter="actionFilter"
        v-model:min-confidence="minConfidence"
        :items="scanItems"
        :loading="scanLoading"
        :action-filters="actionFilters"
        @refresh="scanSymbols"
        @select="selectOpportunity"
      />

      <TimeframeSummaryPanel
        :result="timeframeSummary"
        :loading="timeframeLoading"
        @refresh="loadTimeframeSummary"
        @select="selectTimeframeItem"
      />

      <HistoricalSimulationPanel
        :result="historicalSimulation"
        :loading="simulationLoading"
        @run="runSimulation"
      />

      <p v-if="error" class="p-3 rounded-xl bg-red-100 text-red-800">
        {{ error }}
      </p>

      <section v-if="result" class="flex gap-5 items-start max-lg:flex-col">
        <div class="flex-1 min-w-0 grid gap-5 max-lg:w-full">
          <ChartPanel :result="result" />

          <DetectedPatterns :patterns="result.patterns" />
        </div>

        <SuggestionCard :result="result" />
      </section>
    </section>
  </main>
</template>
