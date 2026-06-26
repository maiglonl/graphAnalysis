<script setup lang="ts">
const { locale, locales, setLocale } = useI18n();
</script>

<template>
  <div class="flex gap-1">
    <button
      v-for="loc in locales"
      :key="loc.code"
      class="px-2 py-1 text-sm rounded-lg transition-colors cursor-pointer"
      :class="
        locale === loc.code
          ? 'bg-blue-600 text-white'
          : 'text-slate-500 hover:bg-slate-100'
      "
      @click="setLocale(loc.code)"
    >
      {{ loc.code.split('-')[0].toUpperCase() }}
    </button>
  </div>
</template>
