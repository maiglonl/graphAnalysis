<script setup lang="ts">
import type { AnalyzeResponse } from '#shared/types/market';

const props = defineProps<{
  result: AnalyzeResponse;
}>();

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
        <div
          v-for="item in scoreItems"
          :key="item.key"
          class="flex justify-between gap-3"
        >
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
