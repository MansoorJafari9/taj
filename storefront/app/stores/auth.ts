import type { ActiveCustomer } from '~/services/api/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const customer = ref<ActiveCustomer | null>(null)
  const initialized = ref(false)
  const isAuthenticated = computed(() => customer.value !== null)

  function setCustomer(value: ActiveCustomer | null) {
    customer.value = value
    initialized.value = true
  }

  return { customer, initialized, isAuthenticated, setCustomer }
})
