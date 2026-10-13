import type { ApiClient } from './client'

export type OrderLineSummary = {
  id: string
  quantity: number
  unitPriceWithTax: number
  linePriceWithTax: number
  discountedUnitPriceWithTax: number
  discountedLinePriceWithTax: number
  productVariant: {
    id: string
    name: string
    product: { id: string, slug: string }
  }
  featuredAsset: { preview: string } | null
}

export type ActiveOrderSummary = {
  id: string
  code: string
  state: string
  totalWithTax: number
  currencyCode: string
  totalQuantity: number
  shippingWithTax: number
  shippingAddress?: { fullName?: string | null, phoneNumber?: string | null, streetLine1?: string | null, streetLine2?: string | null, city?: string | null, province?: string | null, postalCode?: string | null, countryCode?: string | null } | null
  shippingLines?: Array<{ shippingMethod: { id: string, name: string } }>
  lines: OrderLineSummary[]
}

type OrderMutationResult =
  | (ActiveOrderSummary & { __typename: 'Order' })
  | { __typename: string, errorCode: string, message: string, quantityAvailable?: number, order?: ActiveOrderSummary | null }

export class OrderMutationError extends Error {
  constructor(readonly code: string, readonly quantityAvailable?: number) {
    super(code)
    this.name = 'OrderMutationError'
  }
}

const orderFields = `
  id code state totalWithTax currencyCode totalQuantity shippingWithTax
  shippingAddress { fullName phoneNumber streetLine1 streetLine2 city province postalCode countryCode }
  shippingLines { shippingMethod { id name } }
  lines {
    id quantity unitPriceWithTax linePriceWithTax discountedUnitPriceWithTax discountedLinePriceWithTax
    productVariant { id name product { id slug } }
    featuredAsset { preview }
  }
`

const activeOrderQuery = `query ActiveOrder { activeOrder { ${orderFields} } }`

const addItemMutation = `
  mutation AddItemToOrder($productVariantId: ID!, $quantity: Int!) {
    addItemToOrder(productVariantId: $productVariantId, quantity: $quantity) {
      __typename
      ... on Order { ${orderFields} }
      ... on ErrorResult { errorCode message }
      ... on InsufficientStockError { quantityAvailable order { ${orderFields} } }
    }
  }
`

const adjustLineMutation = `
  mutation AdjustOrderLine($orderLineId: ID!, $quantity: Int!) {
    adjustOrderLine(orderLineId: $orderLineId, quantity: $quantity) {
      __typename
      ... on Order { ${orderFields} }
      ... on ErrorResult { errorCode message }
      ... on InsufficientStockError { quantityAvailable order { ${orderFields} } }
    }
  }
`

const removeLineMutation = `
  mutation RemoveOrderLine($orderLineId: ID!) {
    removeOrderLine(orderLineId: $orderLineId) {
      __typename
      ... on Order { ${orderFields} }
      ... on ErrorResult { errorCode message }
    }
  }
`

function unwrapOrder(result: OrderMutationResult): ActiveOrderSummary {
  if ('errorCode' in result) throw new OrderMutationError(result.errorCode, result.quantityAvailable)
  return result
}

export function createOrdersService(client: ApiClient) {
  return {
    async getActive(): Promise<ActiveOrderSummary | null> {
      const data = await client.query<{ activeOrder: ActiveOrderSummary | null }>({ query: activeOrderQuery })
      return data.activeOrder
    },
    async addItem(productVariantId: string, quantity: number): Promise<ActiveOrderSummary> {
      const data = await client.query<{ addItemToOrder: OrderMutationResult }, { productVariantId: string, quantity: number }>({
        query: addItemMutation,
        variables: { productVariantId, quantity },
      })
      return unwrapOrder(data.addItemToOrder)
    },
    async adjustLine(orderLineId: string, quantity: number): Promise<ActiveOrderSummary> {
      const data = await client.query<{ adjustOrderLine: OrderMutationResult }, { orderLineId: string, quantity: number }>({
        query: adjustLineMutation,
        variables: { orderLineId, quantity },
      })
      return unwrapOrder(data.adjustOrderLine)
    },
    async removeLine(orderLineId: string): Promise<ActiveOrderSummary> {
      const data = await client.query<{ removeOrderLine: OrderMutationResult }, { orderLineId: string }>({
        query: removeLineMutation,
        variables: { orderLineId },
      })
      return unwrapOrder(data.removeOrderLine)
    },
    async setShippingAddress(input: { fullName: string, streetLine1: string, streetLine2?: string, city: string, province: string, postalCode: string, phoneNumber: string, countryCode: string }) {
      const data = await client.query<{ setOrderShippingAddress: OrderMutationResult }, { input: typeof input }>({
        query: `mutation SetShippingAddress($input: CreateAddressInput!) { setOrderShippingAddress(input: $input) { __typename ... on Order { ${orderFields} } ... on ErrorResult { errorCode message } } }`,
        variables: { input },
      })
      return unwrapOrder(data.setOrderShippingAddress)
    },
    async eligibleShippingMethods(): Promise<Array<{ id: string, name: string, description: string, priceWithTax: number }>> {
      const data = await client.query<{ eligibleShippingMethods: Array<{ id: string, name: string, description: string, priceWithTax: number }> }>({
        query: `query EligibleShippingMethods { eligibleShippingMethods { id name description priceWithTax } }`,
      })
      return data.eligibleShippingMethods
    },
    async setShippingMethod(id: string) {
      const data = await client.query<{ setOrderShippingMethod: OrderMutationResult }, { ids: string[] }>({
        query: `mutation SetShippingMethod($ids: [ID!]!) { setOrderShippingMethod(shippingMethodId: $ids) { __typename ... on Order { ${orderFields} } ... on ErrorResult { errorCode message } } }`,
        variables: { ids: [id] },
      })
      return unwrapOrder(data.setOrderShippingMethod)
    },
    async transitionTo(state: 'AddingItems' | 'ArrangingPayment') {
      const data = await client.query<{ transitionOrderToState: OrderMutationResult }, { state: string }>({
        query: `mutation TransitionOrder($state: String!) { transitionOrderToState(state: $state) { __typename ... on Order { ${orderFields} } ... on ErrorResult { errorCode message } } }`,
        variables: { state },
      })
      return unwrapOrder(data.transitionOrderToState)
    },
    async startZarinpal(languageCode: 'fa' | 'en'): Promise<{ url: string, authority: string }> {
      const data = await client.query<{ startZarinpalPayment: { url: string, authority: string } }>({
        query: `mutation StartZarinpalPayment { startZarinpalPayment { url authority } }`,
        languageCode,
      })
      return data.startZarinpalPayment
    },
    async confirmZarinpal(authority: string, status: string): Promise<{ success: boolean, orderCode: string, referenceId: string | null }> {
      const data = await client.query<{ confirmZarinpalPayment: { success: boolean, orderCode: string, referenceId: string | null } }, { authority: string, status: string }>({
        query: `mutation ConfirmZarinpalPayment($authority: String!, $status: String!) { confirmZarinpalPayment(authority: $authority, status: $status) { success orderCode referenceId } }`,
        variables: { authority, status },
      })
      return data.confirmZarinpalPayment
    },
  }
}
