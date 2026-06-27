<script setup lang="ts">
import type { AnalysisHistorySnapshot } from '~/composables/useTechnicalScannerDashboard';

defineProps<{
  items: AnalysisHistorySnapshot[];
}>();

const emit = defineEmits<{
  select: [item: AnalysisHistorySnapshot];
}>();

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}
</script>

<template>
  <section class="bg-white border border-slate-200 rounded-2xl p-4 mb-5">
    <div class="mb-3">
      <h2 class="m-0 text-xl">
        {{ $t('history.title') }}
      </h2>

      <p class="mt-1 mb-0 text-slate-500">
        {{ $t('history.subtitle') }}
      </p>
    </div>

    <div v-if="items.length" class="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
      <button
        v-for="item in items"
        :key="`${item.symbol}:${item.interval}`"
        class="border border-slate-200 rounded-xl p-3 bg-white cursor-pointer text-left hover:bg-slate-50"
        @click="emit('select', item)"
      >
        <div class="flex justify-between items-center gap-3">
          <strong>{{ item.symbol }}</strong>

          <span class="px-2 py-1 rounded-full text-xs font-bold uppercase" :class="getActionClass(item.action)">
            {{ $t(`actions.${item.action}`) }}
          </span>
        </div>

        <p class="mt-2 mb-0 text-sm text-slate-500">
          {{ item.interval }} · {{ $t('opportunities.confidence', { value: item.confidence }) }}
        </p>

        <p class="mt-1 mb-0 text-xs text-slate-400">
          {{ formatDate(item.createdAt) }}
        </p>
      </button>
    </div>

    <p v-else class="text-slate-500 mb-0">
      {{ $t('history.empty') }}
    </p>
  </section>
</template>
