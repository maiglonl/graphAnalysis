<script setup lang="ts">
const props = defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  analyze: [payload: { symbol: string; interval: string }];
}>();

const symbol = defineModel<string>("symbol", { default: "BTCUSDT" });
const interval = defineModel<string>("interval", { default: "1h" });

function submit() {
  emit("analyze", { symbol: symbol.value, interval: interval.value });
}
</script>

<template>
  <section
    class="bg-white border border-slate-200 rounded-2xl p-4 mb-5 flex gap-3 items-center flex-wrap"
  >
    <input
      v-model="symbol"
      placeholder="BTCUSDT"
      class="h-10 px-3 border border-slate-300 rounded-xl"
      @keyup.enter="submit"
    />

    <select v-model="interval" class="h-10 px-3 border border-slate-300 rounded-xl">
      <option value="15m">15m</option>
      <option value="1h">1h</option>
      <option value="4h">4h</option>
      <option value="1d">1d</option>
    </select>

    <button
      :disabled="props.loading"
      class="h-10 px-4 rounded-xl bg-blue-600 text-white cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      @click="submit"
    >
      {{ props.loading ? "Analisando..." : "Analisar" }}
    </button>
  </section>
</template>
