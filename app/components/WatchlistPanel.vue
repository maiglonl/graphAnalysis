<script setup lang="ts">
defineProps<{
  items: string[];
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  add: [];
  addCurrent: [];
  remove: [symbol: string];
  select: [symbol: string];
}>();
</script>

<template>
  <section class="bg-white border border-slate-200 rounded-2xl p-4 mb-5">
    <div class="flex justify-between items-start gap-3 mb-3 max-md:flex-col">
      <div>
        <h2 class="m-0 text-xl">
          {{ $t('watchlist.title') }}
        </h2>

        <p class="mt-1 mb-0 text-slate-500">
          {{ $t('watchlist.subtitle') }}
        </p>
      </div>

      <button
        class="h-10 px-4 border-0 rounded-xl bg-slate-900 text-white cursor-pointer"
        @click="emit('addCurrent')"
      >
        {{ $t('watchlist.addCurrent') }}
      </button>
    </div>

    <form class="flex gap-2 mb-3 max-sm:flex-col" @submit.prevent="emit('add')">
      <input
        :value="modelValue"
        class="h-10 px-3 border border-slate-300 rounded-xl flex-1"
        :placeholder="$t('watchlist.placeholder')"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >

      <button class="h-10 px-4 border-0 rounded-xl bg-blue-600 text-white cursor-pointer">
        {{ $t('watchlist.add') }}
      </button>
    </form>

    <div v-if="items.length" class="flex flex-wrap gap-2">
      <div
        v-for="item in items"
        :key="item"
        class="flex items-center gap-2 border border-slate-200 rounded-full pl-3 pr-1 py-1 bg-slate-50"
      >
        <button class="border-0 bg-transparent font-bold cursor-pointer" @click="emit('select', item)">
          {{ item }}
        </button>

        <button
          class="w-7 h-7 border-0 rounded-full bg-white text-slate-500 cursor-pointer"
          :aria-label="$t('watchlist.remove')"
          @click="emit('remove', item)"
        >
          ×
        </button>
      </div>
    </div>

    <p v-else class="text-slate-500 mb-0">
      {{ $t('watchlist.empty') }}
    </p>
  </section>
</template>
