import type { ApiClient } from './client'
import type { PaginatedResult } from '~/types/pagination'
import type { SupportedLocale } from '~/constants/locales'

export type CustomerOrder = {
  id: string
  code: string
  state: string
  createdAt: string
  orderPlacedAt: string | null
  totalWithTax: number
  totalQuantity: number
  currencyCode: string
  lines: Array<{
    id: string
    quantity: number
    discountedLinePriceWithTax: number
    productVariant: { id: string, name: string, product: { id: string, slug: string } }
    featuredAsset: { preview: string } | null
  }>
}

export type CustomerOrderDetail = CustomerOrder & {
  subTotalWithTax: number
  shippingWithTax: number
  shippingAddress: {
    fullName: string | null
    phoneNumber: string | null
    country: string | null
    province: string | null
    city: string | null
    streetLine1: string | null
    streetLine2: string | null
    postalCode: string | null
  } | null
  shippingLines: Array<{ id: string, shippingMethod: { name: string } }>
  payments: Array<{ id: string, state: string, method: string, transactionId: string | null }> | null
  fulfillments: Array<{ id: string, state: string, trackingCode: string | null }> | null
}

const listQuery = `
  query CustomerOrders($options: OrderListOptions) {
    activeCustomer {
      orders(options: $options) {
        totalItems
        items {
          id code state createdAt orderPlacedAt totalWithTax totalQuantity currencyCode
          lines {
            id quantity discountedLinePriceWithTax
            productVariant { id name product { id slug } }
            featuredAsset { preview }
          }
        }
      }
    }
  }
`

const detailQuery = `
  query CustomerOrderDetail($id: ID!) {
    order(id: $id) {
      id code state createdAt orderPlacedAt totalWithTax totalQuantity currencyCode
      subTotalWithTax shippingWithTax
      shippingAddress { fullName phoneNumber country province city streetLine1 streetLine2 postalCode }
      shippingLines { id shippingMethod { name } }
      payments { id state method transactionId }
      fulfillments { id state trackingCode }
      lines {
        id quantity discountedLinePriceWithTax
        productVariant { id name product { id slug } }
        featuredAsset { preview }
      }
    }
  }
`

export function createCustomerOrdersService(client: ApiClient) {
  return {
    async list(skip: number, take: number, locale: SupportedLocale): Promise<PaginatedResult<CustomerOrder>> {
      const data = await client.query<
        { activeCustomer: { orders: PaginatedResult<CustomerOrder> } | null },
        { options: { skip: number, take: number, sort: { orderPlacedAt: 'DESC' }, filter: { orderPlacedAt: { isNull: false } } } }
      >({
        query: listQuery,
        variables: { options: { skip, take, sort: { orderPlacedAt: 'DESC' }, filter: { orderPlacedAt: { isNull: false } } } },
        languageCode: locale,
      })
      if (!data.activeCustomer) throw new Error('UNAUTHENTICATED')
      return data.activeCustomer.orders
    },
    async getById(id: string, locale: SupportedLocale): Promise<CustomerOrderDetail | null> {
      const data = await client.query<{ order: CustomerOrderDetail | null }, { id: string }>({
        query: detailQuery,
        variables: { id },
        languageCode: locale,
      })
      return data.order
    },
  }
}
