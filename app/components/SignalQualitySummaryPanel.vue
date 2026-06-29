<script setup lang="ts">
import type { SignalQualitySummary } from '#shared/types/market';

defineProps<{
  summary: SignalQualitySummary;
}>();
</script>

<template>
  <section class="bg-white border border-slate-200 rounded-2xl p-4">
    <h2 class="m-0 mb-3 text-xl">
      {{ $t('signalQuality.title') }}
    </h2>

    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <h3 class="mt-0 mb-2 text-base font-semibold text-slate-600">
          {{ $t('signalQuality.byFamily') }}
        </h3>

        <table v-if="summary.byFamily.length" class="w-full text-sm border-collapse">
          <thead>
            <tr class="text-left text-slate-500">
              <th class="pb-1 pr-2 font-medium">{{ $t('signalQuality.byFamily') }}</th>
              <th class="pb-1 pr-2 font-medium text-right">{{ $t('signalQuality.total') }}</th>
              <th class="pb-1 pr-2 font-medium text-right">{{ $t('signalQuality.bullish') }}</th>
              <th class="pb-1 pr-2 font-medium text-right">{{ $t('signalQuality.bearish') }}</th>
              <th class="pb-1 font-medium text-right">{{ $t('signalQuality.averageConfidence') }}</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in summary.byFamily"
              :key="item.key"
              class="border-t border-slate-100"
            >
              <td class="py-1 pr-2">{{ $t(`signalQuality.families.${item.key}`, item.key) }}</td>
              <td class="py-1 pr-2 text-right font-medium">{{ item.total }}</td>
              <td class="py-1 pr-2 text-right text-green-700">{{ item.bullish }}</td>
              <td class="py-1 pr-2 text-right text-red-700">{{ item.bearish }}</td>
              <td class="py-1 text-right text-slate-600">{{ item.averageConfidence }}%</td>
            </tr>
          </tbody>
        </table>

        <p v-else class="text-slate-400 text-sm m-0">
          —
        </p>
      </div>

      <div>
        <h3 class="mt-0 mb-2 text-base font-semibold text-slate-600">
          {{ $t('signalQuality.byRole') }}
        </h3>

        <table v-if="summary.byRole.length" class="w-full text-sm border-collapse">
          <thead>
            <tr class="text-left text-slate-500">
              <th class="pb-1 pr-2 font-medium">{{ $t('signalQuality.byRole') }}</th>
              <th class="pb-1 pr-2 font-medium text-right">{{ $t('signalQuality.total') }}</th>
              <th class="pb-1 pr-2 font-medium text-right">{{ $t('signalQuality.bullish') }}</th>
              <th class="pb-1 pr-2 font-medium text-right">{{ $t('signalQuality.bearish') }}</th>
              <th class="pb-1 font-medium text-right">{{ $t('signalQuality.averageConfidence') }}</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in summary.byRole"
              :key="item.key"
              class="border-t border-slate-100"
            >
              <td class="py-1 pr-2">{{ $t(`signalQuality.roles.${item.key}`, item.key) }}</td>
              <td class="py-1 pr-2 text-right font-medium">{{ item.total }}</td>
              <td class="py-1 pr-2 text-right text-green-700">{{ item.bullish }}</td>
              <td class="py-1 pr-2 text-right text-red-700">{{ item.bearish }}</td>
              <td class="py-1 text-right text-slate-600">{{ item.averageConfidence }}%</td>
            </tr>
          </tbody>
        </table>

        <p v-else class="text-slate-400 text-sm m-0">
          —
        </p>
      </div>
    </div>
  </section>
</template>
