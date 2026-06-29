<script setup lang="ts">
import type { HistoricalSimulationResult, IntervalEnum } from '#shared/types/market';
import type { ScoreCalibrationResult } from '#shared/utils/scoreCalibration';

type HistoricalSimulationMetricsComparison = {
  totalTradesDelta: number;
  winRateDelta: number;
  averageReturnDelta: number;
  maxDrawdownDelta: number;
  averageConfidenceDelta: number;
};

type CalibratedHistoricalSimulationResult = {
  symbol: string;
  interval: IntervalEnum;
  raw: HistoricalSimulationResult;
  calibrated: HistoricalSimulationResult;
  calibration: ScoreCalibrationResult;
  comparison: HistoricalSimulationMetricsComparison;
};

defineProps<{
  result: CalibratedHistoricalSimulationResult | null;
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
          {{ $t('calibratedBacktesting.title') }}
        </h2>

        <p class="mt-1 mb-0 text-slate-500">
          {{ $t('calibratedBacktesting.subtitle') }}
        </p>
      </div>

      <button
        :disabled="loading"
        class="h-10 px-4 border-0 rounded-xl bg-slate-900 text-white cursor-pointer disabled:opacity-50"
        @click="emit('refresh')"
      >
        {{ loading ? $t('common.analyzing') : $t('calibratedBacktesting.run') }}
      </button>
    </div>

    <template v-if="result">
      <!-- Metrics comparison table -->
      <table class="w-full text-sm border-collapse mb-4">
        <thead>
          <tr class="text-left text-slate-500">
            <th class="pb-2 pr-3 font-medium"></th>
            <th class="pb-2 pr-3 font-medium text-right">{{ $t('calibratedBacktesting.raw') }}</th>
            <th class="pb-2 pr-3 font-medium text-right">{{ $t('calibratedBacktesting.calibrated') }}</th>
            <th class="pb-2 font-medium text-right">{{ $t('calibratedBacktesting.delta') }}</th>
          </tr>
        </thead>

        <tbody>
          <tr class="border-t border-slate-100">
            <td class="py-2 pr-3 text-slate-500">{{ $t('simulation.totalTrades') }}</td>
            <td class="py-2 pr-3 text-right font-medium">{{ result.raw.metrics.totalTrades }}</td>
            <td class="py-2 pr-3 text-right font-medium">{{ result.calibrated.metrics.totalTrades }}</td>
            <td class="py-2 text-right font-bold" :class="deltaClass(result.comparison.totalTradesDelta)">
              {{ formatDelta(result.comparison.totalTradesDelta) }}
            </td>
          </tr>

          <tr class="border-t border-slate-100">
            <td class="py-2 pr-3 text-slate-500">{{ $t('simulation.winRate') }}</td>
            <td class="py-2 pr-3 text-right font-medium">{{ result.raw.metrics.winRate }}%</td>
            <td class="py-2 pr-3 text-right font-medium">{{ result.calibrated.metrics.winRate }}%</td>
            <td class="py-2 text-right font-bold" :class="deltaClass(result.comparison.winRateDelta)">
              {{ formatDelta(result.comparison.winRateDelta, '%') }}
            </td>
          </tr>

          <tr class="border-t border-slate-100">
            <td class="py-2 pr-3 text-slate-500">{{ $t('simulation.averageReturn') }}</td>
            <td class="py-2 pr-3 text-right font-medium">{{ result.raw.metrics.averageReturn }}%</td>
            <td class="py-2 pr-3 text-right font-medium">{{ result.calibrated.metrics.averageReturn }}%</td>
            <td class="py-2 text-right font-bold" :class="deltaClass(result.comparison.averageReturnDelta)">
              {{ formatDelta(result.comparison.averageReturnDelta, '%') }}
            </td>
          </tr>

          <tr class="border-t border-slate-100">
            <td class="py-2 pr-3 text-slate-500">{{ $t('simulation.maxDrawdown') }}</td>
            <td class="py-2 pr-3 text-right font-medium">{{ result.raw.metrics.maxDrawdown }}%</td>
            <td class="py-2 pr-3 text-right font-medium">{{ result.calibrated.metrics.maxDrawdown }}%</td>
            <td class="py-2 text-right font-bold" :class="deltaClass(-result.comparison.maxDrawdownDelta)">
              {{ formatDelta(result.comparison.maxDrawdownDelta, '%') }}
            </td>
          </tr>

          <tr class="border-t border-slate-100">
            <td class="py-2 pr-3 text-slate-500">{{ $t('simulation.averageConfidence') }}</td>
            <td class="py-2 pr-3 text-right font-medium">{{ result.raw.metrics.averageConfidence }}%</td>
            <td class="py-2 pr-3 text-right font-medium">{{ result.calibrated.metrics.averageConfidence }}%</td>
            <td class="py-2 text-right font-bold" :class="deltaClass(result.comparison.averageConfidenceDelta)">
              {{ formatDelta(result.comparison.averageConfidenceDelta, '%') }}
            </td>
          </tr>
        </tbody>
      </table>

      <p class="text-xs text-slate-400 m-0">
        {{ $t('calibratedBacktesting.disclaimer') }}
      </p>
    </template>

    <p v-else class="text-slate-500 mb-0">
      {{ $t('calibratedBacktesting.empty') }}
    </p>
  </section>
</template>
