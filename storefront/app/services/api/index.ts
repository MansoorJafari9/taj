import type { ApiClient } from './client'
import { createAuthService } from './auth.service'
import { createCategoriesService } from './categories.service'
import { createOrdersService } from './orders.service'
import { createProductsService } from './products.service'
import { createSiteSettingsService } from './site-settings.service'
import { createBlogService } from './blog.service'
import { createCustomerOrdersService } from './customer-orders.service'
import { createCustomerAddressesService } from './customer-addresses.service'

export function createApiServices(client: ApiClient) {
  return {
    auth: createAuthService(client),
    categories: createCategoriesService(client),
    orders: createOrdersService(client),
    customerOrders: createCustomerOrdersService(client),
    customerAddresses: createCustomerAddressesService(client),
    products: createProductsService(client),
    siteSettings: createSiteSettingsService(client),
    blog: createBlogService(client),
  }
}

export type ApiServices = ReturnType<typeof createApiServices>
