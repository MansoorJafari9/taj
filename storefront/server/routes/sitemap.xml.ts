type Item = { id: string, slug: string, updatedAt?: string }
type List = { items: Item[], totalItems: number }

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]!)
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const base = config.public.siteUrl.replace(/\/$/, '')
  const urls = new Map<string, string | undefined>()
  const add = (path: string, updatedAt?: string) => urls.set(`${base}${path}`, updatedAt)

  for (const language of ['fa', 'en']) {
    for (const path of ['', '/products', '/categories', '/about', '/contact']) add(`/${language}${path}`)
  }

  async function fetchAll(field: 'blogPosts' | 'products' | 'collections', language: string): Promise<Item[]> {
    const items: Item[] = []
    const headers: Record<string, string> = { 'content-type': 'application/json' }
    if (config.public.channelToken) headers['vendure-token'] = config.public.channelToken
    const query = `query Sitemap($options: ${field === 'blogPosts' ? 'BlogPostListOptions' : field === 'products' ? 'ProductListOptions' : 'CollectionListOptions'}) {
      ${field}(options: $options) { totalItems items { id slug updatedAt } }
    }`
    for (let skip = 0; ; skip += 50) {
      const response = await $fetch<{ data?: Record<string, List>, errors?: unknown[] }>(config.public.apiBaseUrl, {
        method: 'POST', headers, query: { languageCode: language }, body: { query, variables: { options: { skip, take: 50 } } },
      })
      if (response.errors?.length || !response.data?.[field]) throw new Error(`Sitemap ${field} query failed`)
      const page = response.data[field]
      items.push(...page.items)
      if (items.length >= page.totalItems || !page.items.length) break
    }
    return items
  }

  try {
    for (const language of ['fa', 'en']) {
      const [posts, products, categories] = await Promise.all([
        fetchAll('blogPosts', language), fetchAll('products', language), fetchAll('collections', language),
      ])
      if (posts.length) add(`/${language}/blog`)
      for (const post of posts) add(`/${language}/blog/${encodeURIComponent(post.slug)}`, post.updatedAt)
      for (const product of products) add(`/${language}/products/${encodeURIComponent(product.slug || `id-${product.id}`)}`, product.updatedAt)
      for (const category of categories) add(`/${language}/categories/${encodeURIComponent(category.slug || `id-${category.id}`)}`, category.updatedAt)
    }
  } catch (error) {
    console.error('Could not include dynamic pages in sitemap', error)
  }

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=300, s-maxage=3600')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...urls].map(([url, updatedAt]) => `<url><loc>${escapeXml(url)}</loc>${updatedAt ? `<lastmod>${escapeXml(updatedAt)}</lastmod>` : ''}</url>`).join('')}</urlset>`
})
