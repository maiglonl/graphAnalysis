<script setup lang="ts">
import type { HistoricalSimulationResult } from '#shared/types/market';

type HistoricalTimeframeSummaryResponse = {
  symbol: string;
  items: HistoricalSimulationResult[];
};

defineProps<{
  result: HistoricalTimeframeSummaryResponse | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
}>();
</script>

<template>
  <section class="bg-white border border-slate-200 rounded-2xl p-4 mb-5">
    <div class="flex justify-between items-start gap-3 mb-3 max-md:flex-col">
      <div>
        <h2 class="m-0 text-xl">
          {{ $t('simulation.title') }} · {{ $t('timeframes.title') }}
        </h2>

        <p class="mt-1 mb-0 text-slate-500">
          {{ $t('simulation.subtitle') }}
        </p>
      </div>

      <button
        :disabled="loading"
        class="h-10 px-4 border-0 rounded-xl bg-slate-900 text-white cursor-pointer disabled:opacity-50"
        @click="emit('refresh')"
      >
        {{ loading ? $t('common.analyzing') : $t('timeframes.refresh') }}
      </button>
    </div>

    <div v-if="result?.items.length" class="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
      <article
        v-for="item in result.items"
        :key="item.interval"
        class="border border-slate-200 rounded-xl p-3 bg-white"
      >
        <div class="flex justify-between items-center gap-3">
          <strong>{{ item.interval }}</strong>

          <span class="text-sm text-slate-500">
            {{ item.metrics.totalTrades }} {{ $t('simulation.totalTrades') }}
          </span>
        </div>

        <dl class="grid grid-cols-2 gap-2 mt-3 mb-0 text-sm">
          <div>
            <dt class="text-slate-500">{{ $t('simulation.winRate') }}</dt>
            <dd class="m-0 font-bold">{{ item.metrics.winRate }}%</dd>
          </div>

          <div>
            <dt class="text-slate-500">{{ $t('simulation.averageReturn') }}</dt>
            <dd class="m-0 font-bold">{{ item.metrics.averageReturn }}%</dd>
          </div>

          <div>
            <dt class="text-slate-500">{{ $t('simulation.maxDrawdown') }}</dt>
            <dd class="m-0 font-bold">{{ item.metrics.maxDrawdown }}%</dd>
          </div>

          <div>
            <dt class="text-slate-500">{{ $t('simulation.averageConfidence') }}</dt>
            <dd class="m-0 font-bold">{{ item.metrics.averageConfidence }}%</dd>
          </div>
        </dl>
      </article>
    </div>

    <p v-else class="text-slate-500 mb-0">
      {{ $t('timeframes.empty') }}
    </p>
  </section>
</template>
