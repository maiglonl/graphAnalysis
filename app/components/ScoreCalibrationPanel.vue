<script setup lang="ts">
import type { IntervalEnum, PatternIdEnum } from '#shared/types/market';
import type { ScoreCalibrationResult } from '#shared/utils/scoreCalibration';
import type { CalibrationImpactSummary } from '#shared/utils/calibrationImpact';

type HistoricalScoreCalibrationResult = ScoreCalibrationResult & {
  symbol: string;
  interval: IntervalEnum;
  calibrationImpact: CalibrationImpactSummary;
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

function adjustmentClass(value: number): string {
  if (value > 0) return 'text-green-700';
  if (value < 0) return 'text-red-700';
  return 'text-slate-500';
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

    <template v-if="result">
      <!-- Calibration impact summary -->
      <div class="mb-4">
        <h3 class="mt-0 mb-2 text-base font-semibold text-slate-600">
          {{ $t('calibration.impactTitle') }}
        </h3>

        <dl class="grid gap-2 grid-cols-2 md:grid-cols-4 mb-3">
          <div class="border border-slate-200 rounded-xl p-3">
            <dt class="text-xs text-slate-500 mb-1">{{ $t('calibration.rawConfidence') }}</dt>
            <dd class="m-0 text-xl font-bold">{{ result.calibrationImpact.averageRawConfidence }}%</dd>
          </div>

          <div class="border border-slate-200 rounded-xl p-3">
            <dt class="text-xs text-slate-500 mb-1">{{ $t('calibration.calibratedConfidence') }}</dt>
            <dd class="m-0 text-xl font-bold">{{ result.calibrationImpact.averageCalibratedConfidence }}%</dd>
          </div>

          <div class="border border-slate-200 rounded-xl p-3">
            <dt class="text-xs text-slate-500 mb-1">{{ $t('calibration.confidenceDelta') }}</dt>
            <dd class="m-0 text-xl font-bold" :class="adjustmentClass(result.calibrationImpact.confidenceDelta)">
              {{ formatAdjustment(result.calibrationImpact.confidenceDelta) }}
            </dd>
          </div>

          <div class="border border-slate-200 rounded-xl p-3">
            <dt class="text-xs text-slate-500 mb-1">{{ $t('calibration.adjustedTrades') }}</dt>
            <dd class="m-0 text-xl font-bold">
              {{ result.calibrationImpact.adjustedTrades }}/{{ result.calibrationImpact.totalTrades }}
            </dd>
          </div>
        </dl>

        <p class="text-sm text-slate-500 m-0">
          <span class="text-green-700 font-medium">{{ result.calibrationImpact.positiveAdjustments }} {{ $t('calibration.positiveAdjustments') }}</span>
          ·
          <span class="text-red-700 font-medium">{{ result.calibrationImpact.negativeAdjustments }} {{ $t('calibration.negativeAdjustments') }}</span>
          ·
          <span class="text-slate-500">{{ result.calibrationImpact.neutralAdjustments }} {{ $t('calibration.neutralAdjustments') }}</span>
          <span v-if="result.calibrationImpact.totalTrades" class="ml-3 text-slate-400">
            ({{ $t('calibration.maxPositiveAdjustment') }}: {{ formatAdjustment(result.calibrationImpact.maxPositiveAdjustment) }}
            / {{ $t('calibration.maxNegativeAdjustment') }}: {{ formatAdjustment(result.calibrationImpact.maxNegativeAdjustment) }})
          </span>
        </p>
      </div>

      <!-- Signal quality adjustments: family -->
      <div v-if="result.signalQualityAdjustments.familyAdjustments.length" class="mb-4">
        <h3 class="mt-0 mb-2 text-base font-semibold text-slate-600">
          {{ $t('calibration.familyAdjustments') }}
        </h3>

        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="text-left text-slate-500">
              <th class="pb-1 pr-2 font-medium">{{ $t('calibration.key') }}</th>
              <th class="pb-1 pr-2 font-medium text-right">{{ $t('calibration.sampleSize') }}</th>
              <th class="pb-1 pr-2 font-medium text-right">{{ $t('simulation.winRate') }}</th>
              <th class="pb-1 pr-2 font-medium text-right">{{ $t('simulation.averageReturn') }}</th>
              <th class="pb-1 font-medium text-right">{{ $t('calibration.adjustment') }}</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in result.signalQualityAdjustments.familyAdjustments"
              :key="item.key"
              class="border-t border-slate-100"
            >
              <td class="py-1 pr-2">{{ $t(`signalQuality.families.${item.key}`, item.key) }}</td>
              <td class="py-1 pr-2 text-right">
                {{ item.sampleSize }}
                <span v-if="!item.isReliable" class="text-slate-400 ml-1">({{ $t('calibration.notReliable') }})</span>
              </td>
              <td class="py-1 pr-2 text-right">{{ item.winRate.toFixed(1) }}%</td>
              <td class="py-1 pr-2 text-right">{{ item.averageReturn.toFixed(2) }}%</td>
              <td class="py-1 text-right font-medium" :class="adjustmentClass(item.adjustment)">
                {{ formatAdjustment(item.adjustment) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Signal quality adjustments: role -->
      <div v-if="result.signalQualityAdjustments.roleAdjustments.length" class="mb-4">
        <h3 class="mt-0 mb-2 text-base font-semibold text-slate-600">
          {{ $t('calibration.roleAdjustments') }}
        </h3>

        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="text-left text-slate-500">
              <th class="pb-1 pr-2 font-medium">{{ $t('calibration.key') }}</th>
              <th class="pb-1 pr-2 font-medium text-right">{{ $t('calibration.sampleSize') }}</th>
              <th class="pb-1 pr-2 font-medium text-right">{{ $t('simulation.winRate') }}</th>
              <th class="pb-1 pr-2 font-medium text-right">{{ $t('simulation.averageReturn') }}</th>
              <th class="pb-1 font-medium text-right">{{ $t('calibration.adjustment') }}</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in result.signalQualityAdjustments.roleAdjustments"
              :key="item.key"
              class="border-t border-slate-100"
            >
              <td class="py-1 pr-2">{{ $t(`signalQuality.roles.${item.key}`, item.key) }}</td>
              <td class="py-1 pr-2 text-right">
                {{ item.sampleSize }}
                <span v-if="!item.isReliable" class="text-slate-400 ml-1">({{ $t('calibration.notReliable') }})</span>
              </td>
              <td class="py-1 pr-2 text-right">{{ item.winRate.toFixed(1) }}%</td>
              <td class="py-1 pr-2 text-right">{{ item.averageReturn.toFixed(2) }}%</td>
              <td class="py-1 text-right font-medium" :class="adjustmentClass(item.adjustment)">
                {{ formatAdjustment(item.adjustment) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pattern adjustments -->
      <div v-if="result.patternAdjustments.length">
        <h3 class="mt-0 mb-2 text-base font-semibold text-slate-600">
          {{ $t('calibration.patternAdjustments') }}
        </h3>

        <div class="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="item in result.patternAdjustments"
            :key="item.patternId"
            class="border border-slate-200 rounded-xl p-3 bg-white"
          >
            <div class="flex justify-between items-center gap-3">
              <strong class="text-sm">{{ $t(patternName(item.patternId)) }}</strong>

              <span class="font-bold text-sm" :class="adjustmentClass(item.adjustment)">
                {{ formatAdjustment(item.adjustment) }}
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
      </div>
    </template>

    <p v-else class="text-slate-500 mb-0">
      {{ $t('calibration.empty') }}
    </p>
  </section>
</template>
