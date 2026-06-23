# Tailwind CSS v4 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all manual inline styles in the Vue components with Tailwind CSS v4 utility classes, extract the trade action → class mapping into a reusable Nuxt composable, and leave zero CSS in component files.

**Architecture:** Install `@tailwindcss/vite` and wire it into Nuxt's Vite config alongside a single `assets/main.css` entry point. A new composable `app/composables/useTradeAction.ts` centralises the buy/sell/wait badge class logic so future components can reuse it. All inline `style=""` attributes are replaced with Tailwind utility classes using only standard (non-arbitrary) values.

**Tech Stack:** Nuxt 4, Vue 3, Tailwind CSS v4 (`@tailwindcss/vite`), TypeScript

## Global Constraints

- Tailwind v4 only — do NOT install `@nuxtjs/tailwindcss` or any v3 tooling
- No arbitrary values (bracket notation like `[420px]`) anywhere — use standard Tailwind scale values
- No scoped `<style>` blocks — zero CSS remains in component files after migration
- No `tailwind.config.js` — Tailwind v4 is configured via CSS only
- Standard Tailwind values to use for approximations: `max-w-6xl` (≈1180px), `min-h-96` (≈420px), `rounded-xl` (≈10px), `w-80` (≈340px)

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `assets/main.css` | Single Tailwind entry point |
| Modify | `nuxt.config.ts` | Register Vite plugin and global CSS |
| Create | `app/composables/useTradeAction.ts` | `getActionClass(action?)` mapping |
| Modify | `app/pages/index.vue` | Full inline style → Tailwind class migration |
| Modify | `app/components/PriceChart.client.vue` | One inline style → class |

---

## Task 1: Tailwind v4 Setup

**Files:**
- Create: `assets/main.css`
- Modify: `nuxt.config.ts`

**Interfaces:**
- Produces: Tailwind utility classes available globally in all Vue templates

- [ ] **Step 1: Install `@tailwindcss/vite`**

```bash
npm install -D @tailwindcss/vite
```

Expected: `@tailwindcss/vite` added to `devDependencies` in `package.json`.

- [ ] **Step 2: Create the CSS entry file**

Create `assets/main.css` with exactly this content:

```css
@import "tailwindcss";
```

- [ ] **Step 3: Update `nuxt.config.ts`**

Replace the entire file with:

```ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
})
```

- [ ] **Step 4: Verify Tailwind loads**

Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000` in a browser. Add a temporary `class="text-red-500"` to any element in `app/app.vue` (e.g., on the outer `<div>`). If the text turns red, Tailwind is working. Remove the test class before committing.

- [ ] **Step 5: Commit**

```bash
git add assets/main.css nuxt.config.ts package.json package-lock.json
git commit -m "feat: install and configure Tailwind CSS v4"
```

---

## Task 2: Create `useTradeAction` Composable

**Files:**
- Create: `app/composables/useTradeAction.ts`

**Interfaces:**
- Produces: `getActionClass(action?: string): string` — auto-imported by Nuxt in all components

- [ ] **Step 1: Create the composable**

Create `app/composables/useTradeAction.ts` with this exact content:

```ts
import { TradeActionEnum } from '#shared/types/market'

export function getActionClass(action?: string): string {
  switch (action) {
    case TradeActionEnum.Buy:  return 'bg-green-100 text-green-800'
    case TradeActionEnum.Sell: return 'bg-red-100 text-red-800'
    case TradeActionEnum.Wait: return 'bg-yellow-100 text-yellow-800'
    default:                   return 'bg-slate-100 text-slate-700'
  }
}
```

The `default` branch handles both `TradeActionEnum.None` and any undefined value.

- [ ] **Step 2: Verify Nuxt auto-imports it**

With the dev server running (`npm run dev`), add this anywhere in `app/pages/index.vue`'s `<script setup>`:

```ts
console.log(getActionClass('buy'))
```

Open the browser console at `http://localhost:3000`. If you see `bg-green-100 text-green-800` logged, auto-import is working. Remove the `console.log` line before committing.

- [ ] **Step 3: Commit**

```bash
git add app/composables/useTradeAction.ts
git commit -m "feat: add useTradeAction composable with getActionClass"
```

---

## Task 3: Refactor `PriceChart.client.vue`

**Files:**
- Modify: `app/components/PriceChart.client.vue`

**Interfaces:**
- Consumes: Tailwind globals from Task 1

- [ ] **Step 1: Replace the inline style on the chart container**

In `app/components/PriceChart.client.vue`, find the `<template>` block (line 127):

```html
<template>
  <div ref="chartEl" style="width: 100%; min-height: 420px" />
</template>
```

Replace it with:

```html
<template>
  <div ref="chartEl" class="w-full min-h-96" />
</template>
```

- [ ] **Step 2: Verify the chart renders**

With the dev server running, open `http://localhost:3000` and trigger an analysis. Confirm the candlestick chart renders at the expected size with no visual regression. The chart's internal canvas is controlled by `lightweight-charts` and is unaffected by this class change.

- [ ] **Step 3: Commit**

```bash
git add app/components/PriceChart.client.vue
git commit -m "refactor: replace PriceChart inline style with Tailwind classes"
```

---

## Task 4: Refactor `index.vue`

**Files:**
- Modify: `app/pages/index.vue`

**Interfaces:**
- Consumes: `getActionClass` from Task 2 (auto-imported — no explicit import needed)

This is the largest change. Replace the entire file with the following. The `<script setup>` loses the `actionStyle` computed (replaced by `getActionClass` from the composable). All `style=""` attributes become `class=""` attributes.

- [ ] **Step 1: Replace the full file content**

Replace `app/pages/index.vue` with:

```vue
<script setup lang="ts">
const symbol = ref("BTCUSDT");
const interval = ref("1h");
const result = ref<any>(null);
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
      err?.data?.message || err?.message || "Erro ao analisar ativo.";
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
      <header class="mb-6">
        <h1 class="text-4xl m-0">Scanner Técnico</h1>

        <p class="text-slate-500 mt-2">
          Sugestões automáticas baseadas em padrões técnicos, estrutura e price
          action.
        </p>
      </header>

      <section
        class="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center flex-wrap mb-5"
      >
        <input
          v-model="symbol"
          placeholder="BTCUSDT"
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
          {{ loading ? "Analisando..." : "Analisar" }}
        </button>
      </section>

      <p
        v-if="error"
        class="bg-red-100 text-red-800 p-3 rounded-xl"
      >
        {{ error }}
      </p>

      <section
        v-if="result"
        class="flex gap-5 items-start"
      >
        <div
          class="flex-1 min-w-0 bg-white border border-slate-200 rounded-2xl p-4"
        >
          <div class="flex justify-between items-center mb-3">
            <div>
              <h2 class="m-0">
                {{ result.symbol }} · {{ result.interval }}
              </h2>

              <p class="mt-1 mb-0 text-slate-500">
                Preço atual: {{ result.price }}
              </p>
            </div>

            <span
              class="px-3 py-2 rounded-full font-bold"
              :class="getActionClass(result.suggestion.action)"
            >
              {{ result.suggestion.label }}
            </span>
          </div>

          <PriceChart :candles="result.candles" :patterns="result.patterns" />
        </div>

        <aside
          class="w-80 shrink-0 bg-white border border-slate-200 rounded-2xl p-5"
        >
          <h3 class="mt-0">Plano da operação</h3>

          <div class="text-5xl font-extrabold mb-1">
            {{ result.suggestion.confidence }}%
          </div>

          <p class="text-slate-500 mt-0">Confiança estimada</p>

          <div v-if="result.suggestion.entry" class="grid gap-2.5">
            <div>
              <small>Entrada</small>
              <strong class="block">
                {{ result.suggestion.entry }}
              </strong>
            </div>

            <div>
              <small>Stop</small>
              <strong class="block">
                {{ result.suggestion.stop }}
              </strong>
            </div>

            <div>
              <small>Alvos</small>
              <strong class="block">
                {{ result.suggestion.targets?.join(" · ") }}
              </strong>
            </div>
          </div>

          <hr class="border-0 border-t border-slate-200 my-5" />

          <h4>Padrões detectados</h4>

          <ul v-if="result.patterns.length" class="pl-4">
            <li
              v-for="pattern in result.patterns"
              :key="pattern.id"
              class="mb-2.5"
            >
              <strong>{{ pattern.name }}</strong>
              <br />
              <span class="text-slate-500">
                {{ pattern.reason }}
              </span>
            </li>
          </ul>

          <p v-else class="text-slate-500">
            Nenhum padrão relevante detectado no candle atual.
          </p>

          <small class="block text-slate-400 mt-5">
            {{ result.disclaimer }}
          </small>
        </aside>
      </section>
    </section>
  </main>
</template>
```

- [ ] **Step 2: Verify in browser**

With the dev server running, open `http://localhost:3000`. Check:

1. Page background is light grey (`bg-slate-50`), content is centred and padded
2. Controls bar (input, select, button) is displayed in a white rounded card
3. Click "Analisar" — the button turns semi-transparent while loading (`disabled:opacity-50`)
4. After data loads, the two-column layout appears: chart on the left (flexible width), sidebar on the right (~320px wide)
5. The badge (Compra/Venda/Aguardar) shows a green/red/yellow background with matching dark text
6. The candlestick chart renders inside its flex column at full width
7. Resize the browser window — confirm the layout doesn't break

- [ ] **Step 3: Commit**

```bash
git add app/pages/index.vue
git commit -m "refactor: migrate index.vue to Tailwind CSS v4 utility classes"
```
