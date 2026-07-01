<script setup lang="ts">
import type { IntervalEnum } from '#shared/types/market';

type HistoricalResultCacheStatusEntry = {
  key: string;
  kind: string;
  symbol: string;
  interval: IntervalEnum;
  limit: number;
  variant: number;
  ageMs: number;
  ttlRemainingMs: number;
};

type HistoricalResultCacheStatus = {
  size: number;
  maxEntries: number;
  ttlMs: number;
  entries: HistoricalResultCacheStatusEntry[];
  entriesByKind: Record<string, number>;
};

defineProps<{
  status: HistoricalResultCacheStatus | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

function ttlSeconds(ms: number): string {
  return `${Math.round(ms / 1000)}s`;
}
</script>

<template>
  <section class="bg-white border border-slate-200 rounded-2xl p-4 mb-5">
    <div class="flex justify-between items-start gap-3 mb-3 max-md:flex-col">
      <div>
        <h2 class="m-0 text-xl">
          {{ $t('cacheStatus.title') }}
        </h2>

        <p class="mt-1 mb-0 text-slate-500">
          {{ $t('cacheStatus.subtitle') }}
        </p>
      </div>

      <button
        :disabled="loading"
        class="h-10 px-4 border-0 rounded-xl bg-slate-900 text-white cursor-pointer disabled:opacity-50"
        @click="emit('refresh')"
      >
        {{ loading ? $t('common.analyzing') : $t('cacheStatus.refresh') }}
      </button>
    </div>

    <template v-if="status">
      <!-- Summary row -->
      <dl class="flex gap-4 flex-wrap mb-4 text-sm">
        <div>
          <dt class="text-slate-500 inline">{{ $t('cacheStatus.entries') }}: </dt>
          <dd class="font-semibold inline">{{ status.size }}/{{ status.maxEntries }}</dd>
        </div>

        <div>
          <dt class="text-slate-500 inline">{{ $t('cacheStatus.ttl') }}: </dt>
          <dd class="font-semibold inline">{{ ttlSeconds(status.ttlMs) }}</dd>
        </div>
      </dl>

      <!-- By kind -->
      <div v-if="Object.keys(status.entriesByKind).length > 0" class="mb-4">
        <p class="text-sm font-semibold text-slate-600 mb-2 mt-0">
          {{ $t('cacheStatus.entriesByKind') }}
        </p>

        <ul class="list-none p-0 m-0 flex flex-wrap gap-2">
          <li
            v-for="(count, kind) in status.entriesByKind"
            :key="kind"
            class="text-xs bg-slate-100 rounded-lg px-2 py-1"
          >
            <span class="text-slate-500">{{ kind }}</span>
            <span class="font-semibold ml-1">×{{ count }}</span>
          </li>
        </ul>
      </div>

      <!-- Entry list -->
      <div v-if="status.entries.length > 0">
        <p class="text-sm font-semibold text-slate-600 mb-2 mt-0">
          {{ $t('cacheStatus.entries') }}
        </p>

        <div class="overflow-x-auto">
          <table class="w-full text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="text-left py-1 pr-3 font-medium text-slate-500">{{ $t('cacheStatus.kind') }}</th>
                <th class="text-left py-1 pr-3 font-medium text-slate-500">{{ $t('cacheStatus.symbol') }}</th>
                <th class="text-left py-1 pr-3 font-medium text-slate-500">{{ $t('cacheStatus.interval') }}</th>
                <th class="text-left py-1 pr-3 font-medium text-slate-500">{{ $t('cacheStatus.variant') }}</th>
                <th class="text-right py-1 font-medium text-slate-500">{{ $t('cacheStatus.ttlRemaining') }}</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="entry in status.entries"
                :key="entry.key"
                class="border-b border-slate-100"
              >
                <td class="py-1 pr-3 text-slate-600">{{ entry.kind }}</td>
                <td class="py-1 pr-3 font-medium">{{ entry.symbol }}</td>
                <td class="py-1 pr-3 text-slate-500">{{ entry.interval }}</td>
                <td class="py-1 pr-3 text-slate-500">{{ entry.variant || '—' }}</td>
                <td class="py-1 text-right font-mono">{{ ttlSeconds(entry.ttlRemainingMs) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p v-else class="text-slate-500 mb-0 text-sm">
        {{ $t('cacheStatus.empty') }}
      </p>
    </template>

    <p v-else class="text-slate-500 mb-0">
      {{ $t('cacheStatus.empty') }}
    </p>
  </section>
</template>
