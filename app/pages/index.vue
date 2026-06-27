<script setup lang="ts">
const {
  symbol,
  interval,
  intervals,
  symbolsToScan,
  actionFilter,
  minConfidence,
  actionFilters,
  result,
  historicalSimulation,
  timeframeSummary,
  loading,
  scanLoading,
  simulationLoading,
  timeframeLoading,
  error,
  scanItems,
  analyze,
  scanSymbols,
  runSimulation,
  loadTimeframeSummary,
  selectOpportunity,
  selectTimeframeItem,
} = useTechnicalScannerDashboard();
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
