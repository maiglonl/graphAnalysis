<script setup lang="ts">
import type { AnalyzeResponse } from "#shared/types/market";

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
      query: {
        symbol: symbol.value,
        interval: interval.value,
      },
    });
  } catch (err: any) {
    error.value = err?.message || "Erro ao analisar ativo.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main style="max-width: 960px; margin: 0 auto; padding: 32px">
    <h1>Scanner Técnico</h1>

    <section style="display: flex; gap: 12px; margin: 24px 0">
      <input v-model="symbol" placeholder="BTCUSDT" />

      <select v-model="interval">
        <option value="15m">15m</option>
        <option value="1h">1h</option>
        <option value="4h">4h</option>
        <option value="1d">1d</option>
      </select>

      <button :disabled="loading" @click="analyze">
        {{ loading ? "Analisando..." : "Analisar" }}
      </button>
    </section>

    <p v-if="error" style="color: red">
      {{ error }}
    </p>

    <section
      v-if="result"
      style="border: 1px solid #ddd; border-radius: 16px; padding: 24px"
    >
      <h2>{{ result.symbol }} · {{ result.interval }}</h2>
      <p>Preço atual: {{ result.price }}</p>

      <h3>{{ result.suggestion.label }}</h3>
      <p>Confiança: {{ result.suggestion.confidence }}%</p>

      <div v-if="result.suggestion.entry">
        <p>Entrada: {{ result.suggestion.entry }}</p>
        <p>Stop: {{ result.suggestion.stop }}</p>

        <p>
          Alvos:
          {{ result.suggestion.targets?.join(", ") }}
        </p>
      </div>

      <h4>Padrões detectados</h4>

      <ul v-if="result.patterns.length">
        <li v-for="pattern in result.patterns" :key="pattern.id">
          <strong>{{ pattern.name }}</strong> — {{ pattern.reason }}
        </li>
      </ul>

      <p v-else>Nenhum padrão relevante detectado no candle atual.</p>

      <small>{{ result.disclaimer }}</small>
    </section>
  </main>
</template>
