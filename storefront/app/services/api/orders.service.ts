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
  id code state totalWithTax currencyCode totalQuantity
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
  }
}
