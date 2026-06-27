<script setup lang="ts">
import type { IntervalEnum, PatternIdEnum } from '#shared/types/market';
import type { PatternScoreCalibration } from '#shared/utils/scoreCalibration';

type HistoricalScoreCalibrationResult = {
  symbol: string;
  interval: IntervalEnum;
  patternAdjustments: PatternScoreCalibration[];
};

defineProps<{
  result: HistoricalScoreCalibrationResult | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

function patternName(patternId: PatternIdEnum): string {
  return `patterns.${patternId}.name`;
}

function formatAdjustment(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}
</script>

<template>
  <section class="bg-white border border-slate-200 rounded-2xl p-4 mb-5">
    <div class="flex justify-between items-start gap-3 mb-3 max-md:flex-col">
      <div>
        <h2 class="m-0 text-xl">
          {{ $t('calibration.title') }}
        </h2>

        <p class="mt-1 mb-0 text-slate-500">
          {{ $t('calibration.subtitle') }}
        </p>
      </div>

      <button
        :disabled="loading"
        class="h-10 px-4 border-0 rounded-xl bg-slate-900 text-white cursor-pointer disabled:opacity-50"
        @click="emit('refresh')"
      >
        {{ loading ? $t('common.analyzing') : $t('calibration.run') }}
      </button>
    </div>

    <div v-if="result?.patternAdjustments.length" class="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="item in result.patternAdjustments"
        :key="item.patternId"
        class="border border-slate-200 rounded-xl p-3 bg-white"
      >
        <div class="flex justify-between items-center gap-3">
          <strong>{{ $t(patternName(item.patternId)) }}</strong>

          <span class="font-bold">
            {{ $t('calibration.adjustment') }}: {{ formatAdjustment(item.adjustment) }}
          </span>
        </div>

        <dl class="grid grid-cols-2 gap-2 mt-3 mb-0 text-sm">
          <div>
            <dt class="text-slate-500">{{ $t('calibration.sampleSize') }}</dt>
            <dd class="m-0 font-bold">{{ item.sampleSize }}</dd>
          </div>

          <div>
            <dt class="text-slate-500">{{ $t('simulation.winRate') }}</dt>
            <dd class="m-0 font-bold">{{ item.winRate }}%</dd>
          </div>

          <div>
            <dt class="text-slate-500">{{ $t('simulation.averageReturn') }}</dt>
            <dd class="m-0 font-bold">{{ item.averageReturn }}%</dd>
          </div>

          <div>
            <dt class="text-slate-500">{{ $t('simulation.averageConfidence') }}</dt>
            <dd class="m-0 font-bold">{{ item.averageConfidence }}%</dd>
          </div>
        </dl>

        <p class="mt-3 mb-0 text-sm text-slate-500">
          {{ item.isReliable ? $t('calibration.reliable') : $t('calibration.notReliable') }}
        </p>
      </article>
    </div>

    <p v-else class="text-slate-500 mb-0">
      {{ $t('calibration.empty') }}
    </p>
  </section>
</template>
