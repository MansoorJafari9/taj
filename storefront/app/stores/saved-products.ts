const FAVORITES_KEY = 'myshop:favorites:v1'
const COMPARE_KEY = 'myshop:compare:v1'
export const MAX_COMPARE_PRODUCTS = 4

function readIds(key: string, limit: number): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || '[]')
    if (!Array.isArray(value)) return []
    return [...new Set(value.filter((id): id is string => typeof id === 'string' && id.length > 0 && id.length <= 80))].slice(0, limit)
  }
  catch {
    return []
  }
}

export const useSavedProductsStore = defineStore('saved-products', () => {
  const favoriteIds = ref<string[]>([])
  const compareIds = ref<string[]>([])
  const hydrated = ref(false)

  function hydrate() {
    if (!import.meta.client) return
    favoriteIds.value = readIds(FAVORITES_KEY, 100)
    compareIds.value = readIds(COMPARE_KEY, MAX_COMPARE_PRODUCTS)
    hydrated.value = true
  }

  watch([favoriteIds, compareIds], () => {
    if (!import.meta.client || !hydrated.value) return
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds.value))
      localStorage.setItem(COMPARE_KEY, JSON.stringify(compareIds.value))
    }
    catch { /* Private browsing may disable local storage; keep the current in-memory selection. */ }
  })

  function toggleFavorite(id: string) {
    if (!hydrated.value) hydrate()
    favoriteIds.value = favoriteIds.value.includes(id)
      ? favoriteIds.value.filter(value => value !== id)
      : [...favoriteIds.value, id].slice(-100)
  }

  function toggleCompare(id: string): 'added' | 'removed' | 'full' {
    if (!hydrated.value) hydrate()
    if (compareIds.value.includes(id)) {
      compareIds.value = compareIds.value.filter(value => value !== id)
      return 'removed'
    }
    if (compareIds.value.length >= MAX_COMPARE_PRODUCTS) return 'full'
    compareIds.value = [...compareIds.value, id]
    return 'added'
  }

  function clearFavorites() { favoriteIds.value = [] }
  function clearCompare() { compareIds.value = [] }

  return { favoriteIds, compareIds, hydrated, hydrate, toggleFavorite, toggleCompare, clearFavorites, clearCompare }
})
