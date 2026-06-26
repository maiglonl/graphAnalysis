<script setup lang="ts">
import type { AnalyzeResponse } from '#shared/types/market';
import { DEFAULT_INTERVAL, DEFAULT_SYMBOL, IntervalEnum } from '#shared/types/market';

const { t } = useI18n();

const symbol = ref(DEFAULT_SYMBOL);
const interval = ref<IntervalEnum>(DEFAULT_INTERVAL);
const intervals = Object.values(IntervalEnum) as IntervalEnum[];

const result = ref<AnalyzeResponse | null>(null);
const loading = ref(false);
const error = ref('');

async function analyze() {
  loading.value = true;
  error.value = '';

  try {
    result.value = await $fetch<AnalyzeResponse>('/api/analyze', {
      query: {
        symbol: symbol.value,
        interval: interval.value,
      },
    });
  } catch (err: any) {
    const messageKey = err?.data?.message || err?.message;

    error.value = messageKey?.startsWith?.('errors.') ? t(messageKey) : t('errors.analyzeDefault');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  analyze();
});
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-900 p-8 max-md:p-4">
    <section class="max-w-6xl mx-auto">
      <header class="mb-6 flex justify-between items-start gap-4 max-md:flex-col">
        <div>
          <h1 class="text-4xl m-0">
            {{ $t('scanner.title') }}
          </h1>

          <p class="text-slate-500 mt-2">
            {{ $t('scanner.subtitle') }}
          </p>
        </div>

        <LocaleSwitcher />
      </header>

      <AnalysisForm
        v-model:symbol="symbol"
        v-model:interval="interval"
        :loading="loading"
        :intervals="intervals"
        @analyze="analyze"
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
    </section>
  </main>
</template>
