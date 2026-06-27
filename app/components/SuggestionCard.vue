<script setup lang="ts">
import type { AnalyzeResponse } from '#shared/types/market';
import { buildRiskPlan } from '#shared/utils/riskPlan';

const props = defineProps<{
  result: AnalyzeResponse;
}>();

const accountSize = usePersistedRef('graphAnalysis.accountSize', 10000);
const riskPercent = usePersistedRef('graphAnalysis.riskPercent', 1);

const scoreItems = computed(() => [
  {
    key: 'patternScore',
    labelKey: 'suggestion.scoreBreakdown.patternScore',
    value: props.result.suggestion.scoreBreakdown.patternScore,
  },
  {
    key: 'structureScore',
    labelKey: 'suggestion.scoreBreakdown.structureScore',
    value: props.result.suggestion.scoreBreakdown.structureScore,
  },
  {
    key: 'trendScore',
    labelKey: 'suggestion.scoreBreakdown.trendScore',
    value: props.result.suggestion.scoreBreakdown.trendScore,
  },
  {
    key: 'volumeScore',
    labelKey: 'suggestion.scoreBreakdown.volumeScore',
    value: props.result.suggestion.scoreBreakdown.volumeScore,
  },
  {
    key: 'confluenceBonus',
    labelKey: 'suggestion.scoreBreakdown.confluenceBonus',
    value: props.result.suggestion.scoreBreakdown.confluenceBonus,
  },
  {
    key: 'conflictPenalty',
    labelKey: 'suggestion.scoreBreakdown.conflictPenalty',
    value: -props.result.suggestion.scoreBreakdown.conflictPenalty,
  },
]);

const riskPlan = computed(() => buildRiskPlan({
  accountSize: accountSize.value,
  riskPercent: riskPercent.value,
  entry: props.result.suggestion.entry,
  stop: props.result.suggestion.stop,
  targets: props.result.suggestion.targets,
}));
</script>

<template>
  <aside class="w-80 shrink-0 bg-white border border-slate-200 rounded-2xl p-5 max-lg:w-full">
    <h3 class="mt-0">
      {{ $t('suggestion.title') }}
    </h3>

    <div class="text-5xl font-extrabold mb-1">{{ result.suggestion.confidence }}%</div>

    <p class="text-slate-500 mt-0">
      {{ $t('common.confidence') }}
    </p>

    <div class="border border-slate-200 rounded-xl p-3 mb-5">
      <h4 class="mt-0 mb-3">
        {{ $t('suggestion.scoreBreakdown.title') }}
      </h4>

      <dl class="grid gap-2 m-0 text-sm">
        <div v-for="item in scoreItems" :key="item.key" class="flex justify-between gap-3">
          <dt class="text-slate-500">
            {{ $t(item.labelKey) }}
          </dt>

          <dd class="m-0 font-semibold">
            {{ item.value }}
          </dd>
        </div>
      </dl>
    </div>

    <div v-if="result.suggestion.entry != null" class="grid gap-2.5">
      <div>
        <small>{{ $t('common.entry') }}</small>

        <strong class="block">
          {{ result.suggestion.entry }}
        </strong>
      </div>

      <div>
        <small>{{ $t('common.stop') }}</small>

        <strong class="block">
          {{ result.suggestion.stop }}
        </strong>
      </div>

      <div v-if="result.suggestion.targets?.length">
        <small>{{ $t('common.targets') }}</small>

        <strong class="block">
          {{ result.suggestion.targets.join(' · ') }}
        </strong>
      </div>
    </div>

    <div class="border border-slate-200 rounded-xl p-3 mt-5">
      <h4 class="mt-0 mb-3">
        {{ $t('risk.title') }}
      </h4>

      <div class="grid gap-2 mb-3">
        <label class="grid gap-1 text-sm">
          <span class="text-slate-500">{{ $t('risk.accountSize') }}</span>
          <input v-model.number="accountSize" type="number" min="0" class="h-9 px-3 border border-slate-300 rounded-xl">
        </label>

        <label class="grid gap-1 text-sm">
          <span class="text-slate-500">{{ $t('risk.riskPercent') }}</span>
          <input v-model.number="riskPercent" type="number" min="0" step="0.1" class="h-9 px-3 border border-slate-300 rounded-xl">
        </label>
      </div>

      <dl v-if="riskPlan" class="grid gap-2 m-0 text-sm">
        <div class="flex justify-between gap-3">
          <dt class="text-slate-500">{{ $t('risk.riskAmount') }}</dt>
          <dd class="m-0 font-semibold">{{ riskPlan.riskAmount }}</dd>
        </div>

        <div class="flex justify-between gap-3">
          <dt class="text-slate-500">{{ $t('risk.stopDistance') }}</dt>
          <dd class="m-0 font-semibold">{{ riskPlan.stopDistance }}</dd>
        </div>

        <div class="flex justify-between gap-3">
          <dt class="text-slate-500">{{ $t('risk.positionSize') }}</dt>
          <dd class="m-0 font-semibold">{{ riskPlan.positionSize }}</dd>
        </div>

        <div class="flex justify-between gap-3">
          <dt class="text-slate-500">{{ $t('risk.quantity') }}</dt>
          <dd class="m-0 font-semibold">{{ riskPlan.quantity }}</dd>
        </div>

        <div v-if="riskPlan.riskRewardByTarget.length" class="flex justify-between gap-3">
          <dt class="text-slate-500">{{ $t('risk.riskReward') }}</dt>
          <dd class="m-0 font-semibold">{{ riskPlan.riskRewardByTarget.join(' · ') }}</dd>
        </div>
      </dl>

      <p v-else class="text-slate-500 mb-0 text-sm">
        {{ $t('risk.unavailable') }}
      </p>
    </div>

    <hr class="border-0 border-t border-slate-200 my-5" />

    <h4>
      {{ $t('suggestion.reasons') }}
    </h4>

    <ul v-if="result.suggestion.reasons.length" class="pl-4">
      <li v-for="reason in result.suggestion.reasons" :key="reason" class="mb-2.5">
        <strong>{{ $t(`patterns.${reason}.name`) }}</strong>

        <br />

        <span class="text-slate-500">
          {{ $t(`patterns.${reason}.reason`) }}
        </span>
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
