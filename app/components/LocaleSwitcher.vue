<script setup lang="ts">
import { LOCALE_SWITCHER_CLASSES } from '#shared/utils/colors';

const { locale, locales, setLocale } = useI18n();
</script>

<template>
  <div class="flex gap-1">
    <button
      v-for="loc in locales"
      :key="loc.code"
      class="px-2 py-1 text-sm rounded-lg transition-colors cursor-pointer"
      :class="locale === loc.code ? LOCALE_SWITCHER_CLASSES.active : LOCALE_SWITCHER_CLASSES.inactive"
      @click="setLocale(loc.code)"
    >
      {{ loc.code.split('-')[0].toUpperCase() }}
    </button>
  </div>
</template>
