<script setup lang="ts">
import type { AnalyzeResponse, HistoricalSimulationResult, ScanListResponse } from '#shared/types/market';
import { DEFAULT_INTERVAL, DEFAULT_SYMBOL, IntervalEnum, TradeActionEnum } from '#shared/types/market';

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
const loading = ref(false);
const scanLoading = ref(false);
const simulationLoading = ref(false);
const error = ref('');

const filteredScanItems = computed(() => {
  const items = scanResult.value?.items ?? [];

  return items.filter((item) => {
    const matchesAction = actionFilter.value === 'all' || item.suggestion.action === actionFilter.value;
    const matchesConfidence = item.suggestion.confidence >= minConfidence.value;

    return matchesAction && matchesConfidence;
  });
});

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
  } catch (err: any) {
    const messageKey = err?.data?.message || err?.message;

    error.value = messageKey?.startsWith?.('errors.') ? t(messageKey) : t('errors.analyzeDefault');
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
  } catch (err: any) {
    const messageKey = err?.data?.message || err?.message;

    error.value = messageKey?.startsWith?.('errors.') ? t(messageKey) : t('errors.analyzeDefault');
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
  } catch (err: any) {
    const messageKey = err?.data?.message || err?.message;

    error.value = messageKey?.startsWith?.('errors.') ? t(messageKey) : t('errors.analyzeDefault');
  } finally {
    simulationLoading.value = false;
  }
}

function selectOpportunity(item: AnalyzeResponse) {
  symbol.value = item.symbol;
  interval.value = item.interval;
  result.value = item;
  historicalSimulation.value = null;
}

function actionFilterLabel(filter: OpportunityActionFilter): string {
  return filter === 'all' ? t('opportunities.filters.all') : t(`actions.${filter}`);
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

      <section class="bg-white border border-slate-200 rounded-2xl p-4 mb-5">
        <div class="flex justify-between items-start gap-3 mb-3 max-md:flex-col">
          <div>
            <h2 class="m-0 text-xl">
              {{ $t('opportunities.title') }}
            </h2>

            <p class="mt-1 mb-0 text-slate-500">
              {{ $t('opportunities.subtitle') }}
            </p>
          </div>

          <button
            :disabled="scanLoading"
            class="h-10 px-4 border-0 rounded-xl bg-slate-900 text-white cursor-pointer disabled:opacity-50"
            @click="scanSymbols"
          >
            {{ scanLoading ? $t('common.analyzing') : $t('opportunities.refresh') }}
          </button>
        </div>

        <input
          v-model="symbolsToScan"
          class="w-full h-10 px-3 border border-slate-300 rounded-xl mb-3"
          :placeholder="$t('opportunities.symbolsPlaceholder')"
          @keyup.enter="scanSymbols"
        >

        <div class="grid gap-3 mb-3 md:grid-cols-[1fr_auto] md:items-end">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="filter in actionFilters"
              :key="filter"
              class="px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer text-sm"
              :class="actionFilter === filter ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'"
              @click="actionFilter = filter"
            >
              {{ actionFilterLabel(filter) }}
            </button>
          </div>

          <label class="grid gap-1 text-sm min-w-44">
            <span class="text-slate-500">{{ $t('opportunities.minConfidence') }}</span>
            <input
              v-model.number="minConfidence"
              type="number"
              min="0"
              max="100"
              class="h-9 px-3 border border-slate-300 rounded-xl"
            >
          </label>
        </div>

        <div v-if="filteredScanItems.length" class="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          <button
            v-for="item in filteredScanItems"
            :key="item.symbol"
            class="border border-slate-200 rounded-xl p-3 bg-white cursor-pointer text-left hover:bg-slate-50"
            @click="selectOpportunity(item)"
          >
            <div class="flex justify-between items-center gap-3">
              <strong>{{ item.symbol }} · {{ item.interval }}</strong>

              <span class="px-2 py-1 rounded-full text-xs font-bold uppercase" :class="getActionClass(item.suggestion.action)">
                {{ $t(`actions.${item.suggestion.action}`) }}
              </span>
            </div>

            <p class="mt-2 mb-0 text-sm text-slate-500">
              {{ $t('opportunities.confidence', { value: item.suggestion.confidence }) }}
            </p>
          </button>
        </div>

        <p v-else class="text-slate-500 mb-0">
          {{ $t('opportunities.empty') }}
        </p>
      </section>

      <section class="bg-white border border-slate-200 rounded-2xl p-4 mb-5">
        <div class="flex justify-between items-start gap-3 mb-3 max-md:flex-col">
          <div>
            <h2 class="m-0 text-xl">
              {{ $t('simulation.title') }}
            </h2>

            <p class="mt-1 mb-0 text-slate-500">
              {{ $t('simulation.subtitle') }}
            </p>
          </div>

          <button
            :disabled="simulationLoading"
            class="h-10 px-4 border-0 rounded-xl bg-blue-600 text-white cursor-pointer disabled:opacity-50"
            @click="runSimulation"
          >
            {{ simulationLoading ? $t('common.analyzing') : $t('simulation.run') }}
          </button>
        </div>

        <dl v-if="historicalSimulation" class="grid gap-3 m-0 md:grid-cols-3 lg:grid-cols-6">
          <div class="border border-slate-200 rounded-xl p-3">
            <dt class="text-sm text-slate-500">{{ $t('simulation.totalTrades') }}</dt>
            <dd class="m-0 text-2xl font-bold">{{ historicalSimulation.metrics.totalTrades }}</dd>
          </div>

          <div class="border border-slate-200 rounded-xl p-3">
            <dt class="text-sm text-slate-500">{{ $t('simulation.wins') }}</dt>
            <dd class="m-0 text-2xl font-bold">{{ historicalSimulation.metrics.wins }}</dd>
          </div>

          <div class="border border-slate-200 rounded-xl p-3">
            <dt class="text-sm text-slate-500">{{ $t('simulation.losses') }}</dt>
            <dd class="m-0 text-2xl font-bold">{{ historicalSimulation.metrics.losses }}</dd>
          </div>

          <div class="border border-slate-200 rounded-xl p-3">
            <dt class="text-sm text-slate-500">{{ $t('simulation.expired') }}</dt>
            <dd class="m-0 text-2xl font-bold">{{ historicalSimulation.metrics.expired }}</dd>
          </div>

          <div class="border border-slate-200 rounded-xl p-3">
            <dt class="text-sm text-slate-500">{{ $t('simulation.winRate') }}</dt>
            <dd class="m-0 text-2xl font-bold">{{ historicalSimulation.metrics.winRate }}%</dd>
          </div>

          <div class="border border-slate-200 rounded-xl p-3">
            <dt class="text-sm text-slate-500">{{ $t('simulation.averageRiskReward') }}</dt>
            <dd class="m-0 text-2xl font-bold">{{ historicalSimulation.metrics.averageRiskReward }}</dd>
          </div>
        </dl>

        <p v-else class="text-slate-500 mb-0">
          {{ $t('simulation.empty') }}
        </p>
      </section>

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
