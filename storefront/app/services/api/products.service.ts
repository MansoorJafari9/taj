import type { SupportedLocale } from '~/constants/locales'
import type { PaginatedResult, PaginationInput } from '~/types/pagination'
import type { ProductDetail, ProductListFilters, ProductSummary } from '~/types/product'
import type { ApiClient } from './client'
import { merchandisingCollectionSlugs } from '~/constants/homeCollections'

const productsQuery = `
  query Products($options: ProductListOptions) {
    products(options: $options) {
      items {
        id
        name
        slug
        featuredAsset { id preview }
        variants { id name priceWithTax currencyCode stockLevel saleOffer { percentage } }
      }
      totalItems
    }
  }
`

type ProductsData = { products: PaginatedResult<ProductSummary> }

export function productPath(product: Pick<ProductSummary, 'id' | 'slug'>): string {
  return `/products/${product.slug || `id-${product.id}`}`
}

const productQuery = `
  query Product($id: ID, $slug: String) {
    product(id: $id, slug: $slug) {
      id
      name
      slug
      description
      facetValues { id }
      collections { id slug parent { id } }
      featuredAsset { id preview }
      assets { id preview }
      optionGroups { id code name options { id code name } }
      variants { id name priceWithTax currencyCode stockLevel saleOffer { percentage } facetValues { id } options { id } }
    }
  }
`

const relatedSearchQuery = `
  query RelatedSearch($input: SearchInput!) {
    search(input: $input) {
      items { productId }
    }
  }
`

type RelatedSearchInput = {
  collectionId?: string
  facetValueFilters?: Array<{ or: string[] }>
  groupByProduct: boolean
  inStock: boolean
  take: number
}

type RelatedSearchData = { search: { items: Array<{ productId: string }> } }

export function createProductsService(client: ApiClient) {
  return {
    async list(input: PaginationInput & ProductListFilters & { locale: SupportedLocale }): Promise<PaginatedResult<ProductSummary>> {
      const filter = input.search ? { name: { contains: input.search } } : undefined
      const data = await client.query<ProductsData, { options: PaginationInput & { filter?: { name: { contains: string } } } }>({
        query: productsQuery,
        variables: { options: { skip: input.skip, take: input.take, filter } },
        languageCode: input.locale,
      })
      return data.products
    },

    async listFeatured(locale: SupportedLocale, take = 8): Promise<ProductSummary[]> {
      const data = await client.query<ProductsData, { options: PaginationInput }>({
        query: productsQuery,
        variables: { options: { skip: 0, take } },
        languageCode: locale,
      })
      return data.products.items
    },

    async listOnSale(locale: SupportedLocale, take = 8): Promise<ProductSummary[]> {
      const data = await client.query<ProductsData, { options: PaginationInput }>({
        query: productsQuery,
        variables: { options: { skip: 0, take: 100 } },
        languageCode: locale,
      })
      return data.products.items
        .filter(product => product.variants.some(variant => variant.saleOffer))
        .slice(0, take)
    },

    async listByIds(ids: string[], locale: SupportedLocale): Promise<ProductSummary[]> {
      if (!ids.length) return []
      const uniqueIds = [...new Set(ids)]
      const data = await client.query<ProductsData, { options: { take: number, filter: { id: { in: string[] } } } }>({
        query: productsQuery,
        variables: { options: { take: uniqueIds.length, filter: { id: { in: uniqueIds } } } },
        languageCode: locale,
      })
      const byId = new Map(data.products.items.map(item => [item.id, item]))
      return uniqueIds.map(id => byId.get(id)).filter((item): item is ProductSummary => !!item)
    },

    async getByIdentifier(identifier: string, locale: SupportedLocale): Promise<ProductDetail | null> {
      const byId = identifier.startsWith('id-')
      const data = await client.query<{ product: ProductDetail | null }, { id?: string, slug?: string }>({
        query: productQuery,
        variables: byId ? { id: identifier.slice(3) } : { slug: identifier },
        languageCode: locale,
      })
      return data.product
    },

    async listRelated(product: ProductDetail, locale: SupportedLocale, take = 4): Promise<ProductSummary[]> {
      const ids: string[] = []
      const addCandidates = async (input: Omit<RelatedSearchInput, 'groupByProduct' | 'inStock' | 'take'>) => {
        const data = await client.query<RelatedSearchData, { input: RelatedSearchInput }>({
          query: relatedSearchQuery,
          variables: { input: { ...input, groupByProduct: true, inStock: true, take: 32 } },
          languageCode: locale,
        })
        for (const item of data.search.items) {
          if (item.productId !== product.id && !ids.includes(item.productId)) ids.push(item.productId)
          if (ids.length >= take) break
        }
      }

      const regularCollections = product.collections.filter(collection => !merchandisingCollectionSlugs.has(collection.slug))
      const leafCollection = regularCollections.find(collection => !regularCollections.some(other => other.parent?.id === collection.id))
      if (leafCollection) await addCandidates({ collectionId: leafCollection.id })

      if (ids.length < take) {
        const facetIds = [...new Set([
          ...product.facetValues.map(facet => facet.id),
          ...product.variants.flatMap(variant => variant.facetValues?.map(facet => facet.id) ?? []),
        ])]
        if (facetIds.length) await addCandidates({ facetValueFilters: [{ or: facetIds }] })
      }

      if (!ids.length) return []
      const data = await client.query<ProductsData, { options: { take: number, filter: { id: { in: string[] } } } }>({
        query: productsQuery,
        variables: { options: { take: ids.length, filter: { id: { in: ids } } } },
        languageCode: locale,
      })
      const byId = new Map(data.products.items.map(item => [item.id, item]))
      return ids.map(id => byId.get(id)).filter((item): item is ProductSummary => !!item).slice(0, take)
    },
  }
}
