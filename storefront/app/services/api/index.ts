import type { ApiClient } from './client'
import { createAuthService } from './auth.service'
import { createCategoriesService } from './categories.service'
import { createOrdersService } from './orders.service'
import { createProductsService } from './products.service'

export function createApiServices(client: ApiClient) {
  return {
    auth: createAuthService(client),
    categories: createCategoriesService(client),
    orders: createOrdersService(client),
    products: createProductsService(client),
  }
}

export type ApiServices = ReturnType<typeof createApiServices>
