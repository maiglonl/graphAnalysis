<script setup lang="ts">
import { DEFAULT_INTERVAL, DEFAULT_SYMBOL, IntervalEnum } from "#shared/types/market";

const props = defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  analyze: [payload: { symbol: string; interval: IntervalEnum }];
}>();

const symbol = defineModel<string>("symbol", { default: DEFAULT_SYMBOL });
const interval = defineModel<IntervalEnum>("interval", { default: DEFAULT_INTERVAL });

const intervals = Object.values(IntervalEnum);

function submit() {
  emit("analyze", { symbol: symbol.value, interval: interval.value });
}
</script>

<template>
  <section
    class="bg-white border border-slate-200 rounded-2xl p-4 mb-5 flex gap-3 items-center flex-wrap"
  >
    <input
      v-model="symbol"
      :placeholder="$t('analysisForm.symbolPlaceholder')"
      class="h-10 px-3 border border-slate-300 rounded-xl"
      @keyup.enter="submit"
    />

    <select v-model="interval" class="h-10 px-3 border border-slate-300 rounded-xl">
      <option v-for="iv in intervals" :key="iv" :value="iv">{{ iv }}</option>
    </select>

    <button
      :disabled="props.loading"
      class="h-10 px-4 rounded-xl bg-blue-600 text-white cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      @click="submit"
    >
      {{ props.loading ? $t('common.analyzing') : $t('analysisForm.analyze') }}
    </button>
  </section>
</template>
