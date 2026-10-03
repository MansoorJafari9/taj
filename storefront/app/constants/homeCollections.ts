/** Collections used as homepage shelves, not as product-category navigation. */
export const homeCollectionSlugs = {
  popular: 'popular',
} as const

export const merchandisingCollectionSlugs = new Set<string>(Object.values(homeCollectionSlugs))
