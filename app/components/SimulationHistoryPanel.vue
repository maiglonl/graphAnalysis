<script setup lang="ts">
import type { SimulationHistorySnapshot } from '~/utils/simulationHistory';

defineProps<{
  items: SimulationHistorySnapshot[];
}>();

const emit = defineEmits<{
  select: [item: SimulationHistorySnapshot];
}>();

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}
</script>

<template>
  <section class="bg-white border border-slate-200 rounded-2xl p-4 mb-5">
    <div class="mb-3">
      <h2 class="m-0 text-xl">
        {{ $t('simulationHistory.title') }}
      </h2>

      <p class="mt-1 mb-0 text-slate-500">
        {{ $t('simulationHistory.subtitle') }}
      </p>
    </div>

    <div v-if="items.length" class="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
      <button
        v-for="item in items"
        :key="`${item.symbol}:${item.interval}`"
        class="border border-slate-200 rounded-xl p-3 bg-white cursor-pointer text-left hover:bg-slate-50"
        @click="emit('select', item)"
      >
        <div class="flex justify-between items-center gap-3">
          <strong>{{ item.symbol }}</strong>

          <span class="text-sm text-slate-500">{{ item.interval }}</span>
        </div>

        <dl class="grid grid-cols-2 gap-2 mt-3 mb-0 text-sm">
          <div>
            <dt class="text-slate-500">{{ $t('simulation.totalTrades') }}</dt>
            <dd class="m-0 font-bold">{{ item.totalTrades }}</dd>
          </div>

          <div>
            <dt class="text-slate-500">{{ $t('simulation.winRate') }}</dt>
            <dd class="m-0 font-bold">{{ item.winRate }}%</dd>
          </div>

          <div>
            <dt class="text-slate-500">{{ $t('simulation.averageReturn') }}</dt>
            <dd class="m-0 font-bold">{{ item.averageReturn }}%</dd>
          </div>

          <div>
            <dt class="text-slate-500">{{ $t('simulation.maxDrawdown') }}</dt>
            <dd class="m-0 font-bold">{{ item.maxDrawdown }}%</dd>
          </div>
        </dl>

        <p class="mt-3 mb-0 text-xs text-slate-400">
          {{ formatDate(item.createdAt) }}
        </p>
      </button>
    </div>

    <p v-else class="text-slate-500 mb-0">
      {{ $t('simulationHistory.empty') }}
    </p>
  </section>
</template>
