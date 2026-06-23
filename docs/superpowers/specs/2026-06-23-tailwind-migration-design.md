# Tailwind CSS v4 Migration

**Date:** 2026-06-23
**Status:** Approved

## Goal

Replace all manual inline styles in the Vue components with Tailwind CSS v4 utility classes. No CSS files beyond a single global import. No arbitrary values (bracket notation) anywhere in the codebase.

## Scope

Three files contain styling today:

| File | Styling approach today |
|---|---|
| `app/pages/index.vue` | Extensive inline `style=""` attributes |
| `app/components/PriceChart.client.vue` | One inline style on the container div |
| `app/app.vue` | No styling — no changes needed |

One new file is created:

| File | Purpose |
|---|---|
| `app/composables/useTradeAction.ts` | Reusable action→class mapping |
| `assets/main.css` | Tailwind entry point (`@import "tailwindcss"`) |

## Setup

1. Install `@tailwindcss/vite` as a dev dependency.
2. Register the Vite plugin in `nuxt.config.ts`:
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
3. Create `assets/main.css`:
   ```css
   @import "tailwindcss";
   ```

No `tailwind.config.js` needed. Tailwind v4 auto-scans Vue files for class usage.

## Composable: `app/composables/useTradeAction.ts`

Centralises the trade action → Tailwind class mapping so any future component can reuse it without duplicating logic. Nuxt auto-imports it.

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

## Style mapping: `index.vue`

All inline styles are replaced with the following standard Tailwind utilities. No arbitrary values.

### Layout

| Element | Tailwind classes |
|---|---|
| `<main>` | `min-h-screen bg-slate-50 text-slate-900 p-8` |
| Section wrapper | `max-w-6xl mx-auto` |
| `<header>` | `mb-6` |
| `<h1>` | `text-4xl m-0` |
| Subtitle `<p>` | `text-slate-500 mt-2` |

### Controls bar

| Element | Tailwind classes |
|---|---|
| Controls `<section>` | `bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center flex-wrap mb-5` |
| `<input>` | `h-10 px-3 border border-slate-300 rounded-xl` |
| `<select>` | `h-10 px-3 border border-slate-300 rounded-xl` |
| `<button>` | `h-10 px-4 rounded-xl bg-blue-600 text-white cursor-pointer border-0 disabled:opacity-50` |

### Error message

| Element | Tailwind classes |
|---|---|
| Error `<p>` | `bg-red-100 text-red-800 p-3 rounded-xl` |

### Two-column layout (flex, not grid)

| Element | Tailwind classes |
|---|---|
| Outer wrapper | `flex gap-5 items-start` |
| Chart column | `flex-1 min-w-0 bg-white border border-slate-200 rounded-2xl p-4` |
| Chart header row | `flex justify-between items-center mb-3` |
| Symbol `<h2>` | `m-0` |
| Price `<p>` | `mt-1 mb-0 text-slate-500` |
| Badge `<span>` | `:class="getActionClass(...)"` + `px-3 py-2 rounded-full font-bold` |
| `<aside>` (sidebar) | `w-80 shrink-0 bg-white border border-slate-200 rounded-2xl p-5` |

### Sidebar internals

| Element | Tailwind classes |
|---|---|
| `<h3>` | `mt-0` |
| Confidence value | `text-5xl font-extrabold mb-1` |
| Confidence label | `text-slate-500 mt-0` |
| Entry/Stop/Targets grid | `grid gap-2.5` |
| `<hr>` | `border-0 border-t border-slate-200 my-5` |
| Pattern list `<ul>` | `pl-4` |
| Pattern `<li>` | `mb-2.5` |
| Pattern reason `<span>` | `text-slate-500` |
| Empty patterns `<p>` | `text-slate-500` |
| Disclaimer `<small>` | `block text-slate-400 mt-5` |

### Removed

- `actionStyle` computed property (replaced by `getActionClass` from composable)

## Style mapping: `PriceChart.client.vue`

Single change: `style="width: 100%; min-height: 420px"` → `class="w-full min-h-96"`.

The chart's internal canvas is controlled by `lightweight-charts` and is unaffected.

## Constraints

- **No arbitrary values** — all classes use standard Tailwind scale values
- **No scoped `<style>` blocks** — zero CSS remains in components
- **No `tailwind.config.js`** — Tailwind v4 CSS-first config
- **Tailwind v4 only** — do not install `@nuxtjs/tailwindcss` or any v3 tooling
