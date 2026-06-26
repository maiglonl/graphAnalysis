<script setup lang="ts">
import type { AnalyzeResponse } from "#shared/types/market";

const { t } = useI18n();

const symbol = ref("BTCUSDT");
const interval = ref("1h");
const result = ref<AnalyzeResponse | null>(null);
const loading = ref(false);
const error = ref("");

async function analyze() {
  loading.value = true;
  error.value = "";

  try {
    result.value = await $fetch("/api/analyze", {
      query: { symbol: symbol.value, interval: interval.value },
    });
  } catch (err: any) {
    error.value =
      err?.data?.message || err?.message || t("errors.analyzeDefault");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  analyze();
});
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-900 p-8">
    <section class="max-w-6xl mx-auto">
      <header class="mb-6 flex justify-between items-start">
        <div>
          <h1 class="text-4xl m-0">{{ $t('scanner.title') }}</h1>

          <p class="text-slate-500 mt-2">
            {{ $t('scanner.subtitle') }}
          </p>
        </div>

        <LocaleSwitcher />
      </header>

      <section
        class="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center flex-wrap mb-5"
      >
        <input
          v-model="symbol"
          :placeholder="$t('analysisForm.symbolPlaceholder')"
          class="h-10 px-3 border border-slate-300 rounded-xl"
        />

        <select
          v-model="interval"
          class="h-10 px-3 border border-slate-300 rounded-xl"
        >
          <option value="15m">15m</option>
          <option value="1h">1h</option>
          <option value="4h">4h</option>
          <option value="1d">1d</option>
        </select>

        <button
          :disabled="loading"
          class="h-10 px-4 border-0 rounded-xl bg-blue-600 text-white cursor-pointer disabled:opacity-50"
          @click="analyze"
        >
          {{ loading ? $t('common.analyzing') : $t('analysisForm.analyze') }}
        </button>
      </section>

      <p v-if="error" class="bg-red-100 text-red-800 p-3 rounded-xl">
        {{ error }}
      </p>

      <section v-if="result" class="flex gap-5 items-start">
        <div
          class="flex-1 min-w-0 bg-white border border-slate-200 rounded-2xl p-4"
        >
          <div class="flex justify-between items-center mb-3">
            <div>
              <h2 class="m-0">{{ result.symbol }} · {{ result.interval }}</h2>

              <p class="mt-1 mb-0 text-slate-500">
                {{ $t('scanner.currentPrice', { price: result.price }) }}
              </p>
            </div>

            <span
              class="px-3 py-2 rounded-full font-bold uppercase"
              :class="getActionClass(result.suggestion.action)"
            >
              {{ $t(`actions.${result.suggestion.action}`) }}
            </span>
          </div>

          <PriceChart
            :candles="result.candles"
            :patterns="result.patterns"
            :suggestion="result.suggestion"
          />
        </div>

        <aside
          class="w-80 shrink-0 bg-white border border-slate-200 rounded-2xl p-5"
        >
          <h3 class="mt-0">{{ $t('suggestion.title') }}</h3>

          <div class="text-5xl font-extrabold mb-1">
            {{ result.suggestion.confidence }}%
          </div>

          <p class="text-slate-500 mt-0">{{ $t('common.confidence') }}</p>

          <div v-if="result.suggestion.entry" class="grid gap-2.5">
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

            <div>
              <small>{{ $t('common.targets') }}</small>
              <strong class="block">
                {{ result.suggestion.targets?.join(" · ") }}
              </strong>
            </div>
          </div>

          <hr class="border-0 border-t border-slate-200 my-5" />

          <h4>{{ $t('patterns.title') }}</h4>

          <ul v-if="result.patterns.length" class="pl-4">
            <li
              v-for="pattern in result.patterns"
              :key="pattern.id"
              class="mb-2.5"
            >
              <strong>{{ $t(pattern.name) }}</strong>
              <br />
              <span class="text-slate-500">
                {{ $t(pattern.reason) }}
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
      </section>
    </section>
  </main>
</template>
