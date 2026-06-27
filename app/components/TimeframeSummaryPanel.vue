<script setup lang="ts">
import type { AnalyzeResponse, MultiTimeframeResponse } from '#shared/types/market';

defineProps<{
  result: MultiTimeframeResponse | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
  select: [item: AnalyzeResponse];
}>();
</script>

<template>
  <section class="bg-white border border-slate-200 rounded-2xl p-4 mb-5">
    <div class="flex justify-between items-start gap-3 mb-3 max-md:flex-col">
      <div>
        <h2 class="m-0 text-xl">
          {{ $t('timeframes.title') }}
        </h2>

        <p class="mt-1 mb-0 text-slate-500">
          {{ $t('timeframes.subtitle') }}
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
      <button
        v-for="item in result.items"
        :key="item.interval"
        class="border border-slate-200 rounded-xl p-3 bg-white cursor-pointer text-left hover:bg-slate-50"
        @click="emit('select', item)"
      >
        <div class="flex justify-between items-center gap-3">
          <strong>{{ item.interval }}</strong>

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
      {{ $t('timeframes.empty') }}
    </p>
  </section>
</template>
