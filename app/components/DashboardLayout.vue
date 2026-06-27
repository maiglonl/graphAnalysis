<script setup lang="ts">
defineProps<{
  titleKey: string;
  subtitleKey: string;
}>();
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-900 p-8 max-md:p-4">
    <section class="max-w-6xl mx-auto">
      <header class="mb-6 flex justify-between items-start gap-4 max-md:flex-col">
        <div>
          <h1 class="text-4xl m-0">
            {{ $t(titleKey) }}
          </h1>

          <p class="text-slate-500 mt-2">
            {{ $t(subtitleKey) }}
          </p>
        </div>

        <LocaleSwitcher />
      </header>

      <slot />
    </section>
  </main>
</template>
