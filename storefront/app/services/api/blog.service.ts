import type { SupportedLocale } from '~/constants/locales'
import type { ApiClient } from './client'

export type BlogPost = {
  id: string
  slug: string
  languageCode: SupportedLocale
  title: string
  excerpt: string
  body: string
  coverImageUrl: string | null
  category: string | null
  seoTitle: string | null
  seoDescription: string | null
  publishedAt: string | null
  updatedAt: string
  productIds: string[]
}

export type BlogPostList = { items: BlogPost[], totalItems: number }

const fields = `id slug languageCode title excerpt body coverImageUrl category seoTitle seoDescription publishedAt updatedAt productIds`
const listQuery = `query BlogPosts($options: BlogPostListOptions) {
  blogPosts(options: $options) { totalItems items { ${fields} } }
}`
const detailQuery = `query BlogPost($slug: String!) { blogPost(slug: $slug) { ${fields} } }`

export function createBlogService(client: ApiClient) {
  return {
    async list(locale: SupportedLocale, options: { skip?: number, take?: number, category?: string } = {}): Promise<BlogPostList> {
      const data = await client.query<{ blogPosts: BlogPostList }, { options: typeof options }>({
        query: listQuery,
        variables: { options },
        languageCode: locale,
      })
      return data.blogPosts
    },
    async getBySlug(locale: SupportedLocale, slug: string): Promise<BlogPost | null> {
      const data = await client.query<{ blogPost: BlogPost | null }, { slug: string }>({
        query: detailQuery,
        variables: { slug },
        languageCode: locale,
      })
      return data.blogPost
    },
  }
}
