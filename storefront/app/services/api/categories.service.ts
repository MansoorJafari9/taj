import type { SupportedLocale } from '~/constants/locales'
import type { PaginatedResult, PaginationInput } from '~/types/pagination'
import type { ProductSummary, ProductVariantSummary } from '~/types/product'
import type { ApiClient } from './client'
import { merchandisingCollectionSlugs } from '~/constants/homeCollections'

export type CategorySummary = {
  id: string
  name: string
  slug: string
  description: string
  featuredAsset: { preview: string } | null
  parent: { id: string, slug: string } | null
}

export type CategoryTreeItem = CategorySummary & { children: CategoryTreeItem[] }

export function categoryPath(category: Pick<CategorySummary, 'id' | 'slug'>): string {
  return `/categories/${category.slug || `id-${category.id}`}`
}

const collectionsQuery = `
  query Collections($options: CollectionListOptions) {
    collections(options: $options) {
      items { id name slug description featuredAsset { preview } parent { id slug } }
      totalItems
    }
  }
`

export function createCategoriesService(client: ApiClient) {
  return {
    async list(input: PaginationInput & { locale: SupportedLocale }): Promise<PaginatedResult<CategorySummary>> {
      const data = await client.query<{ collections: PaginatedResult<CategorySummary> }, { options: PaginationInput }>({
        query: collectionsQuery,
        variables: { options: { skip: input.skip, take: input.take } },
        languageCode: input.locale,
      })
      return data.collections
    },

    async listTree(locale: SupportedLocale): Promise<CategoryTreeItem[]> {
      const data = await client.query<{ collections: PaginatedResult<CategorySummary> }, { options: PaginationInput }>({
        query: collectionsQuery,
        variables: { options: { skip: 0, take: 100 } },
        languageCode: locale,
      })
      return withoutMerchandisingCollections(toTree(data.collections.items))
    },

    async getBySlug(identifier: string, locale: SupportedLocale, pagination: PaginationInput): Promise<CategoryDetail | null> {
      const byId = identifier.startsWith('id-')
      const data = await client.query<{ collection: CollectionResponse | null }, { id?: string, slug?: string, options: PaginationInput }>({
        query: collectionQuery,
        variables: { ...(byId ? { id: identifier.slice(3) } : { slug: identifier }), options: pagination },
        languageCode: locale,
      })
      if (!data.collection) return null
      return {
        ...data.collection,
        products: uniqueProducts(data.collection.productVariants.items),
        totalItems: data.collection.productVariants.totalItems,
      }
    },
  }
}

type VariantWithProduct = ProductVariantSummary & { product: Omit<ProductSummary, 'variants'> }

type CollectionResponse = CategorySummary & {
  productVariants: PaginatedResult<VariantWithProduct>
}

function toTree(categories: CategorySummary[]): CategoryTreeItem[] {
  const items = new Map<string, CategoryTreeItem>(categories.map(category => [category.id, { ...category, children: [] }]))
  const roots: CategoryTreeItem[] = []
  for (const item of items.values()) {
    const parent = item.parent ? items.get(item.parent.id) : undefined
    if (parent) parent.children.push(item)
    else roots.push(item)
  }
  return roots
}

function withoutMerchandisingCollections(items: CategoryTreeItem[]): CategoryTreeItem[] {
  return items
    .filter(item => !merchandisingCollectionSlugs.has(item.slug))
    .map(item => ({ ...item, children: withoutMerchandisingCollections(item.children) }))
}

export type CategoryDetail = CategorySummary & {
  products: ProductSummary[]
  totalItems: number
}

const collectionQuery = `
  query Collection($id: ID, $slug: String, $options: ProductVariantListOptions) {
    collection(id: $id, slug: $slug) {
      id
      name
      slug
      description
      featuredAsset { preview }
      productVariants(options: $options) {
        items {
          id
          name
          priceWithTax
          currencyCode
          stockLevel
          saleOffer { percentage }
          product { id name slug featuredAsset { id preview } }
        }
        totalItems
      }
    }
  }
`

function uniqueProducts(variants: VariantWithProduct[]): ProductSummary[] {
  const products = new Map<string, ProductSummary>()
  for (const variant of variants) {
    const existing = products.get(variant.product.id)
    if (existing) existing.variants.push(variant)
    else products.set(variant.product.id, { ...variant.product, variants: [variant] })
  }
  return [...products.values()]
}
