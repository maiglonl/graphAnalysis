import type { Ref } from 'vue';

export function usePersistedRef<T extends string | number | boolean>(key: string, defaultValue: T): Ref<T> {
  const state = ref(defaultValue) as Ref<T>;

  onMounted(() => {
    const stored = localStorage.getItem(key);

    if (stored == null) return;

    state.value = parseStoredValue(stored, defaultValue);
  });

  watch(
    state,
    (value) => {
      localStorage.setItem(key, String(value));
    },
    { flush: 'post' }
  );

  return state;
}

function parseStoredValue<T extends string | number | boolean>(stored: string, defaultValue: T): T {
  if (typeof defaultValue === 'number') {
    const value = Number(stored);
    return (Number.isFinite(value) ? value : defaultValue) as T;
  }

  if (typeof defaultValue === 'boolean') return (stored === 'true') as T;

  return stored as T;
}
