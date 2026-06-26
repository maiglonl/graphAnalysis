<script setup lang="ts">
import type { AnalyzeResponse } from "#shared/types/market";

defineProps<{
  result: AnalyzeResponse;
}>();
</script>

<template>
  <aside class="bg-white border border-slate-200 rounded-2xl p-5">
    <span
      class="inline-block px-3 py-2 rounded-full font-bold uppercase"
      :class="getActionClass(result.suggestion.action)"
    >
      {{ $t(`actions.${result.suggestion.action}`) }}
    </span>

    <div class="text-5xl font-extrabold mt-4">
      {{ result.suggestion.confidence }}%
    </div>

    <p class="text-slate-500 mt-0">{{ $t('common.confidence') }}</p>

    <div v-if="result.suggestion.entry" class="grid gap-2.5">
      <div>
        <small>{{ $t('common.entry') }}</small>
        <strong class="block">{{ result.suggestion.entry }}</strong>
      </div>

      <div>
        <small>{{ $t('common.stop') }}</small>
        <strong class="block">{{ result.suggestion.stop }}</strong>
      </div>

      <div>
        <small>{{ $t('common.targets') }}</small>
        <strong class="block">{{ result.suggestion.targets?.join(' · ') }}</strong>
      </div>
    </div>

    <hr class="border-0 border-t border-slate-200 my-5" />

    <h4>{{ $t('suggestion.reasons') }}</h4>

    <ul v-if="result.suggestion.reasons.length" class="pl-4">
      <li v-for="id in result.suggestion.reasons" :key="id" class="mb-2">
        {{ $t(`patterns.${id}.reason`) }}
      </li>
    </ul>

    <p v-else class="text-slate-500">
      {{ $t('patterns.empty') }}
    </p>

    <small class="block text-slate-400 mt-5">
      {{ $t(result.disclaimer) }}
    </small>
  </aside>
</template>
