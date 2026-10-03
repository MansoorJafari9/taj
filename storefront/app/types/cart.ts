export type CartItem = {
  productId: string
  productVariantId: string
  slug: string
  name: string
  variantName: string
  image: string | null
  unitPrice: number
  currencyCode: string
  quantity: number
}

export type PersistedCart = {
  version: 1
  items: CartItem[]
}
