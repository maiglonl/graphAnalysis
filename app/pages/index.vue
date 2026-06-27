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
  <DashboardLayout title-key="scanner.title" subtitle-key="scanner.subtitle">
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
  </DashboardLayout>
</template>
