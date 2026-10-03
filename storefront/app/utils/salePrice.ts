import type { ProductVariantSummary } from '~/types/product'

export function salePrice(variant: ProductVariantSummary): number | null {
  const percentage = variant.saleOffer?.percentage
  if (percentage == null || percentage <= 0 || percentage > 100) return null
  return Math.round(variant.priceWithTax * (1 - percentage / 100))
}
