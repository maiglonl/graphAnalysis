<script setup lang="ts">
import type { IntervalEnum } from '#shared/types/market';

type MultiWindowWalkForwardSummary = {
  windows: number;
  totalTradesDelta: number;
  winRateDelta: number;
  averageReturnDelta: number;
  maxDrawdownDelta: number;
  averageConfidenceDelta: number;
  improvedWinRateWindows: number;
  improvedReturnWindows: number;
  reducedDrawdownWindows: number;
};

type MultiWindowWalkForwardSimulationResult = {
  symbol: string;
  interval: IntervalEnum;
  summary: MultiWindowWalkForwardSummary;
};

defineProps<{
  result: MultiWindowWalkForwardSimulationResult | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

function formatDelta(value: number, unit = ''): string {
  const formatted = value > 0 ? `+${value}` : String(value);
  return unit ? `${formatted}${unit}` : formatted;
}

function deltaClass(value: number): string {
  if (value > 0) return 'text-green-700';
  if (value < 0) return 'text-red-700';
  return 'text-slate-400';
}
</script>

<template>
  <section class="bg-white border border-slate-200 rounded-2xl p-4 mb-5">
    <div class="flex justify-between items-start gap-3 mb-3 max-md:flex-col">
      <div>
        <h2 class="m-0 text-xl">
          {{ $t('multiWindowWalkForward.title') }}
        </h2>

        <p class="mt-1 mb-0 text-slate-500">
          {{ $t('multiWindowWalkForward.subtitle') }}
        </p>
      </div>

      <button
        :disabled="loading"
        class="h-10 px-4 border-0 rounded-xl bg-slate-900 text-white cursor-pointer disabled:opacity-50"
        @click="emit('refresh')"
      >
        {{ loading ? $t('common.analyzing') : $t('multiWindowWalkForward.run') }}
      </button>
    </div>

    <template v-if="result">
      <!-- Window count badge -->
      <p class="text-sm text-slate-500 mb-3 mt-0">
        {{ $t('multiWindowWalkForward.windows') }}: <strong>{{ result.summary.windows }}</strong>
      </p>

      <!-- Average deltas -->
      <h3 class="mt-0 mb-2 text-base font-semibold text-slate-600">
        {{ $t('multiWindowWalkForward.averageDeltas') }}
      </h3>

      <dl class="grid gap-2 grid-cols-2 md:grid-cols-3 mb-4">
        <div class="border border-slate-200 rounded-xl p-3">
          <dt class="text-xs text-slate-500 mb-1">{{ $t('multiWindowWalkForward.totalTradesDelta') }}</dt>
          <dd class="m-0 text-xl font-bold" :class="deltaClass(result.summary.totalTradesDelta)">
            {{ formatDelta(result.summary.totalTradesDelta) }}
          </dd>
        </div>

        <div class="border border-slate-200 rounded-xl p-3">
          <dt class="text-xs text-slate-500 mb-1">{{ $t('multiWindowWalkForward.winRateDelta') }}</dt>
          <dd class="m-0 text-xl font-bold" :class="deltaClass(result.summary.winRateDelta)">
            {{ formatDelta(result.summary.winRateDelta, '%') }}
          </dd>
        </div>

        <div class="border border-slate-200 rounded-xl p-3">
          <dt class="text-xs text-slate-500 mb-1">{{ $t('multiWindowWalkForward.averageReturnDelta') }}</dt>
          <dd class="m-0 text-xl font-bold" :class="deltaClass(result.summary.averageReturnDelta)">
            {{ formatDelta(result.summary.averageReturnDelta, '%') }}
          </dd>
        </div>

        <div class="border border-slate-200 rounded-xl p-3">
          <dt class="text-xs text-slate-500 mb-1">{{ $t('multiWindowWalkForward.maxDrawdownDelta') }}</dt>
          <dd class="m-0 text-xl font-bold" :class="deltaClass(-result.summary.maxDrawdownDelta)">
            {{ formatDelta(result.summary.maxDrawdownDelta, '%') }}
          </dd>
        </div>

        <div class="border border-slate-200 rounded-xl p-3">
          <dt class="text-xs text-slate-500 mb-1">{{ $t('multiWindowWalkForward.averageConfidenceDelta') }}</dt>
          <dd class="m-0 text-xl font-bold" :class="deltaClass(result.summary.averageConfidenceDelta)">
            {{ formatDelta(result.summary.averageConfidenceDelta, '%') }}
          </dd>
        </div>
      </dl>

      <!-- Window improvement counts -->
      <p class="text-sm text-slate-500 m-0">
        <span class="font-medium text-slate-700">{{ result.summary.improvedWinRateWindows }}/{{ result.summary.windows }}</span>
        {{ $t('multiWindowWalkForward.improvedWinRateWindows') }}
        ·
        <span class="font-medium text-slate-700">{{ result.summary.improvedReturnWindows }}/{{ result.summary.windows }}</span>
        {{ $t('multiWindowWalkForward.improvedReturnWindows') }}
        ·
        <span class="font-medium text-slate-700">{{ result.summary.reducedDrawdownWindows }}/{{ result.summary.windows }}</span>
        {{ $t('multiWindowWalkForward.reducedDrawdownWindows') }}
      </p>
    </template>

    <p v-else class="text-slate-500 mb-0">
      {{ $t('multiWindowWalkForward.empty') }}
    </p>
  </section>
</template>
