<script setup lang="ts">
import type { PatternSignal } from "#shared/types/market";

defineProps<{
  patterns: PatternSignal[];
}>();
</script>

<template>
  <section class="bg-white border border-slate-200 rounded-2xl p-5">
    <h3>{{ $t('patterns.title') }}</h3>

    <ul v-if="patterns.length" class="list-none p-0 m-0">
      <li
        v-for="pattern in patterns"
        :key="pattern.id"
        class="border-b border-slate-200 py-3 last:border-b-0"
      >
        <div class="flex justify-between gap-3">
          <strong>{{ $t(`patterns.${pattern.id}.name`) }}</strong>
          <span>{{ pattern.confidence }}%</span>
        </div>

        <p class="text-slate-500 mt-1.5 mb-0">{{ $t(`patterns.${pattern.id}.reason`) }}</p>
      </li>
    </ul>

    <p v-else class="text-slate-500">
      {{ $t('patterns.empty') }}
    </p>
  </section>
</template>
