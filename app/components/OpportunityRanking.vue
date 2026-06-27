<script setup lang="ts">
import type { AnalyzeResponse } from '#shared/types/market';
import { TradeActionEnum } from '#shared/types/market';

type OpportunityActionFilter = TradeActionEnum | 'all';

const props = defineProps<{
  items: AnalyzeResponse[];
  loading: boolean;
  actionFilters: OpportunityActionFilter[];
}>();

const emit = defineEmits<{
  refresh: [];
  select: [item: AnalyzeResponse];
}>();

const { t } = useI18n();

const symbols = defineModel<string>('symbols', { required: true });
const actionFilter = defineModel<OpportunityActionFilter>('actionFilter', { required: true });
const minConfidence = defineModel<number>('minConfidence', { required: true });

const filteredItems = computed(() => props.items.filter((item) => {
  const matchesAction = actionFilter.value === 'all' || item.suggestion.action === actionFilter.value;
  const matchesConfidence = item.suggestion.confidence >= minConfidence.value;

  return matchesAction && matchesConfidence;
}));

function actionFilterLabel(filter: OpportunityActionFilter): string {
  return filter === 'all' ? t('opportunities.filters.all') : t(`actions.${filter}`);
}
</script>

<template>
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
        :disabled="loading"
        class="h-10 px-4 border-0 rounded-xl bg-slate-900 text-white cursor-pointer disabled:opacity-50"
        @click="emit('refresh')"
      >
        {{ loading ? $t('common.analyzing') : $t('opportunities.refresh') }}
      </button>
    </div>

    <input
      v-model="symbols"
      class="w-full h-10 px-3 border border-slate-300 rounded-xl mb-3"
      :placeholder="$t('opportunities.symbolsPlaceholder')"
      @keyup.enter="emit('refresh')"
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

    <div v-if="filteredItems.length" class="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="item in filteredItems"
        :key="item.symbol"
        class="border border-slate-200 rounded-xl p-3 bg-white cursor-pointer text-left hover:bg-slate-50"
        @click="emit('select', item)"
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
</template>
