<script setup lang="ts">
import type { AnalyzeResponse } from '#shared/types/market';

defineProps<{
  result: AnalyzeResponse;
}>();
</script>

<template>
  <section class="bg-white border border-slate-200 rounded-2xl p-4">
    <div class="flex justify-between items-center mb-3 gap-3">
      <div>
        <h2 class="m-0">{{ result.symbol }} · {{ result.interval }}</h2>

        <p class="mt-1 mb-0 text-slate-500">
          {{ $t('scanner.currentPrice', { price: result.price }) }}
        </p>
      </div>

      <span class="px-3 py-2 rounded-full font-bold uppercase" :class="getActionClass(result.suggestion.action)">
        {{ $t(`actions.${result.suggestion.action}`) }}
      </span>
    </div>

    <PriceChart :candles="result.candles" :patterns="result.patterns" :suggestion="result.suggestion" />
  </section>
</template>
