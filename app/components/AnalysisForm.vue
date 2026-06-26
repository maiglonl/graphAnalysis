<script setup lang="ts">
import type { IntervalEnum } from '#shared/types/market';

defineProps<{
  loading: boolean;
  intervals: IntervalEnum[];
}>();

const emit = defineEmits<{
  analyze: [];
}>();

const symbol = defineModel<string>('symbol', {
  required: true,
});

const interval = defineModel<IntervalEnum>('interval', {
  required: true,
});

function submit() {
  emit('analyze');
}
</script>

<template>
  <section class="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center flex-wrap mb-5">
    <input
      v-model="symbol"
      :placeholder="$t('analysisForm.symbolPlaceholder')"
      class="h-10 px-3 border border-slate-300 rounded-xl"
      @keyup.enter="submit"
    />

    <select v-model="interval" class="h-10 px-3 border border-slate-300 rounded-xl">
      <option v-for="iv in intervals" :key="iv" :value="iv">
        {{ iv }}
      </option>
    </select>

    <button
      :disabled="loading"
      class="h-10 px-4 border-0 rounded-xl bg-blue-600 text-white cursor-pointer disabled:opacity-50"
      @click="submit"
    >
      {{ loading ? $t('common.analyzing') : $t('analysisForm.analyze') }}
    </button>
  </section>
</template>
