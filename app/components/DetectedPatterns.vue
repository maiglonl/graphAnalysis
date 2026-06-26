<script setup lang="ts">
import type { PatternSignal } from '#shared/types/market';

defineProps<{
  patterns: PatternSignal[];
}>();
</script>

<template>
  <section class="bg-white border border-slate-200 rounded-2xl p-5">
    <h3 class="mt-0">
      {{ $t('patterns.title') }}
    </h3>

    <ul v-if="patterns.length" class="list-none p-0 m-0">
      <li v-for="pattern in patterns" :key="pattern.id" class="py-3 border-b border-slate-200 last:border-b-0">
        <div class="flex justify-between gap-3">
          <strong>{{ $t(`patterns.${pattern.id}.name`) }}</strong>

          <span class="text-slate-500"> {{ pattern.confidence }}% </span>
        </div>

        <p class="mt-1 mb-0 text-slate-500">
          {{ $t(`patterns.${pattern.id}.reason`) }}
        </p>
      </li>
    </ul>

    <p v-else class="text-slate-500">
      {{ $t('patterns.empty') }}
    </p>
  </section>
</template>
