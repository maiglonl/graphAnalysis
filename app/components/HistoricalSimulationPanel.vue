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

    <dl v-if="result" class="grid gap-3 m-0 md:grid-cols-2 lg:grid-cols-5">
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
        <dt class="text-sm text-slate-500">{{ $t('simulation.lossRate') }}</dt>
        <dd class="m-0 text-2xl font-bold">{{ result.metrics.lossRate }}%</dd>
      </div>

      <div class="border border-slate-200 rounded-xl p-3">
        <dt class="text-sm text-slate-500">{{ $t('simulation.averageRiskReward') }}</dt>
        <dd class="m-0 text-2xl font-bold">{{ result.metrics.averageRiskReward }}</dd>
      </div>

      <div class="border border-slate-200 rounded-xl p-3">
        <dt class="text-sm text-slate-500">{{ $t('simulation.averageReturn') }}</dt>
        <dd class="m-0 text-2xl font-bold">{{ result.metrics.averageReturn }}%</dd>
      </div>

      <div class="border border-slate-200 rounded-xl p-3">
        <dt class="text-sm text-slate-500">{{ $t('simulation.maxDrawdown') }}</dt>
        <dd class="m-0 text-2xl font-bold">{{ result.metrics.maxDrawdown }}%</dd>
      </div>

      <div class="border border-slate-200 rounded-xl p-3">
        <dt class="text-sm text-slate-500">{{ $t('simulation.averageConfidence') }}</dt>
        <dd class="m-0 text-2xl font-bold">{{ result.metrics.averageConfidence }}%</dd>
      </div>
    </dl>

    <div v-if="result?.familyStats?.length" class="mt-4">
      <h3 class="mt-0 mb-2 text-base font-semibold text-slate-600">
        {{ $t('familyStats.title') }}
      </h3>

      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="text-left text-slate-500">
            <th class="pb-1 pr-2 font-medium">{{ $t('familyStats.family') }}</th>
            <th class="pb-1 pr-2 font-medium text-right">{{ $t('familyStats.totalTrades') }}</th>
            <th class="pb-1 pr-2 font-medium text-right">{{ $t('familyStats.winRate') }}</th>
            <th class="pb-1 pr-2 font-medium text-right">{{ $t('familyStats.averageReturn') }}</th>
            <th class="pb-1 font-medium text-right">{{ $t('familyStats.averageConfidence') }}</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="stat in result.familyStats"
            :key="stat.family"
            class="border-t border-slate-100"
          >
            <td class="py-1 pr-2">{{ $t(`signalQuality.families.${stat.family}`, stat.family) }}</td>
            <td class="py-1 pr-2 text-right">{{ stat.totalTrades }}</td>
            <td class="py-1 pr-2 text-right">{{ stat.winRate }}%</td>
            <td class="py-1 pr-2 text-right">{{ stat.averageReturn }}%</td>
            <td class="py-1 text-right text-slate-600">{{ stat.averageConfidence }}%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else-if="!result" class="text-slate-500 mb-0">
      {{ $t('simulation.empty') }}
    </p>
  </section>
</template>
