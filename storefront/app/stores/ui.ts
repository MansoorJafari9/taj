export const useUiStore = defineStore('ui', () => {
  const isMobileNavigationOpen = ref(false)
  const isCartOpen = ref(false)

  const toggle = () => { isMobileNavigationOpen.value = !isMobileNavigationOpen.value }
  const close = () => { isMobileNavigationOpen.value = false }

  return { isMobileNavigationOpen, isCartOpen, toggle, close }
})
