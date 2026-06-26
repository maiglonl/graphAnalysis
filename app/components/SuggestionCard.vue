<script setup lang="ts">
import type { AnalyzeResponse } from "#shared/types/market";

defineProps<{
  result: AnalyzeResponse;
}>();
</script>

<template>
  <aside class="bg-white border border-slate-200 rounded-2xl p-5">
    <span
      class="inline-block px-3 py-2 rounded-full font-bold"
      :class="getActionClass(result.suggestion.action)"
    >
      {{ result.suggestion.label }}
    </span>

    <div class="text-5xl font-extrabold mt-4">
      {{ result.suggestion.confidence }}%
    </div>

    <p class="text-slate-500 mt-0">Confiança estimada</p>

    <div v-if="result.suggestion.entry" class="grid gap-2.5">
      <div>
        <small>Entrada</small>
        <strong class="block">{{ result.suggestion.entry }}</strong>
      </div>

      <div>
        <small>Stop</small>
        <strong class="block">{{ result.suggestion.stop }}</strong>
      </div>

      <div>
        <small>Alvos</small>
        <strong class="block">{{ result.suggestion.targets?.join(" · ") }}</strong>
      </div>
    </div>

    <hr class="border-0 border-t border-slate-200 my-5" />

    <h4>Motivos</h4>

    <ul v-if="result.suggestion.reasons.length" class="pl-4">
      <li v-for="reason in result.suggestion.reasons" :key="reason" class="mb-2">
        {{ reason }}
      </li>
    </ul>

    <small class="block text-slate-400 mt-5">
      {{ result.disclaimer }}
    </small>
  </aside>
</template>
