export type ProductAsset = {
  id: string
  preview: string
}

export type ProductVariantSummary = {
  id: string
  name: string
  priceWithTax: number
  currencyCode: string
  stockLevel: string
  saleOffer?: { percentage: number } | null
  facetValues?: Array<{ id: string }>
}

export type ProductSummary = {
  id: string
  name: string
  slug: string
  featuredAsset: ProductAsset | null
  variants: ProductVariantSummary[]
}

export type ProductOption = { id: string, code: string, name: string }

export type ProductOptionGroup = {
  id: string
  code: string
  name: string
  options: ProductOption[]
}

export type ProductVariantDetail = ProductVariantSummary & {
  options: Array<{ id: string }>
}

export type ProductDetail = Omit<ProductSummary, 'variants'> & {
  variants: ProductVariantDetail[]
  optionGroups: ProductOptionGroup[]
  description: string
  assets: ProductAsset[]
  facetValues: Array<{ id: string }>
  collections: Array<{ id: string, slug: string, parent: { id: string } | null }>
}

export type ProductListFilters = {
  search?: string
}
