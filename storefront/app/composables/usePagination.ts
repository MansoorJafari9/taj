import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export function usePagination(page: MaybeRefOrGetter<number>, pageSize: MaybeRefOrGetter<number>) {
  const safePage = computed(() => Math.max(1, Math.trunc(toValue(page) || 1)))
  const safePageSize = computed(() => Math.max(1, Math.trunc(toValue(pageSize) || 1)))
  const skip = computed(() => (safePage.value - 1) * safePageSize.value)

  return { page: safePage, pageSize: safePageSize, skip }
}
