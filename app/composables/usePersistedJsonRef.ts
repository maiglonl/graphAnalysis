import type { Ref } from 'vue';

export function usePersistedJsonRef<T>(key: string, defaultValue: T): Ref<T> {
  const state = ref(defaultValue) as Ref<T>;

  onMounted(() => {
    const stored = localStorage.getItem(key);

    if (stored == null) return;

    try {
      state.value = JSON.parse(stored) as T;
    } catch {
      state.value = defaultValue;
    }
  });

  watch(
    state,
    (value) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    { deep: true, flush: 'post' },
  );

  return state;
}
