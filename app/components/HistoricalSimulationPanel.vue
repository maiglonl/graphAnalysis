<script setup lang="ts">
import type { HistoricalSimulationResult } from '#shared/types/market';

defineProps<{
  result: HistoricalSimulationResult | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  run: [];
}>();
</script>

<template>
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
        :disabled="loading"
        class="h-10 px-4 border-0 rounded-xl bg-blue-600 text-white cursor-pointer disabled:opacity-50"
        @click="emit('run')"
      >
        {{ loading ? $t('common.analyzing') : $t('simulation.run') }}
      </button>
    </div>

    <dl v-if="result" class="grid gap-3 m-0 md:grid-cols-3 lg:grid-cols-6">
      <div class="border border-slate-200 rounded-xl p-3">
        <dt class="text-sm text-slate-500">{{ $t('simulation.totalTrades') }}</dt>
        <dd class="m-0 text-2xl font-bold">{{ result.metrics.totalTrades }}</dd>
      </div>

      <div class="border border-slate-200 rounded-xl p-3">
        <dt class="text-sm text-slate-500">{{ $t('simulation.wins') }}</dt>
        <dd class="m-0 text-2xl font-bold">{{ result.metrics.wins }}</dd>
      </div>

      <div class="border border-slate-200 rounded-xl p-3">
        <dt class="text-sm text-slate-500">{{ $t('simulation.losses') }}</dt>
        <dd class="m-0 text-2xl font-bold">{{ result.metrics.losses }}</dd>
      </div>

      <div class="border border-slate-200 rounded-xl p-3">
        <dt class="text-sm text-slate-500">{{ $t('simulation.expired') }}</dt>
        <dd class="m-0 text-2xl font-bold">{{ result.metrics.expired }}</dd>
      </div>

      <div class="border border-slate-200 rounded-xl p-3">
        <dt class="text-sm text-slate-500">{{ $t('simulation.winRate') }}</dt>
        <dd class="m-0 text-2xl font-bold">{{ result.metrics.winRate }}%</dd>
      </div>

      <div class="border border-slate-200 rounded-xl p-3">
        <dt class="text-sm text-slate-500">{{ $t('simulation.averageRiskReward') }}</dt>
        <dd class="m-0 text-2xl font-bold">{{ result.metrics.averageRiskReward }}</dd>
      </div>
    </dl>

    <p v-else class="text-slate-500 mb-0">
      {{ $t('simulation.empty') }}
    </p>
  </section>
</template>
