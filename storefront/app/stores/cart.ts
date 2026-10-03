import { OrderMutationError, type ActiveOrderSummary, type createOrdersService } from '~/services/api/orders.service'

type OrdersService = ReturnType<typeof createOrdersService>

export const useCartStore = defineStore('cart', () => {
  const order = ref<ActiveOrderSummary | null>(null)
  const loaded = ref(false)
  const pendingLoads = ref(0)
  const loading = computed(() => pendingLoads.value > 0)
  const itemCount = computed(() => order.value?.totalQuantity ?? 0)
  let mutationVersion = 0

  async function refresh(service: OrdersService) {
    const version = mutationVersion
    pendingLoads.value++
    try {
      const activeOrder = await service.getActive()
      if (version === mutationVersion) {
        order.value = activeOrder
        loaded.value = true
      }
    } finally {
      pendingLoads.value--
    }
  }

  async function addItem(service: OrdersService, productVariantId: string, quantity: number) {
    mutationVersion++
    try {
      order.value = await service.addItem(productVariantId, quantity)
      loaded.value = true
    } catch (error) {
      if (error instanceof OrderMutationError && error.code === 'INSUFFICIENT_STOCK_ERROR') {
        await refresh(service)
      }
      throw error
    }
  }

  async function adjustLine(service: OrdersService, orderLineId: string, quantity: number) {
    mutationVersion++
    try {
      order.value = await service.adjustLine(orderLineId, quantity)
    } catch (error) {
      if (error instanceof OrderMutationError && error.code === 'INSUFFICIENT_STOCK_ERROR') {
        await refresh(service)
      }
      throw error
    }
  }

  async function removeLine(service: OrdersService, orderLineId: string) {
    mutationVersion++
    order.value = await service.removeLine(orderLineId)
  }

  return { order, loaded, loading, itemCount, refresh, addItem, adjustLine, removeLine }
})
