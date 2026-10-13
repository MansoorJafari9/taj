<script setup lang="ts">
import { contentAsText, sanitizeContent } from '~/utils/sanitizeContent'

const route = useRoute()
const localePath = useLocalePath()
const { t, locale } = useI18n()
const { $services } = useNuxtApp()
const config = useRuntimeConfig()
const siteName = useSiteName()
const slug = computed(() => String(route.params.slug))
const otherLocale = computed(() => locale.value === 'fa' ? 'en' : 'fa')

const { data: post, pending, error } = await useAsyncData(
  'blog-post',
  () => $services.blog.getBySlug(locale.value, slug.value),
  { watch: [slug, locale] },
)
if (import.meta.server && error.value) throw createError({ statusCode: 503, statusMessage: 'Blog temporarily unavailable' })
if (import.meta.server && !post.value) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
const { data: related } = await useAsyncData(
  'blog-related',
  async () => post.value?.category
    ? (await $services.blog.list(locale.value, { category: post.value.category, take: 4 })).items.filter(item => item.id !== post.value?.id).slice(0, 3)
    : [],
  { watch: [post, locale] },
)
const { data: attachedProducts } = await useAsyncData(
  'blog-attached-products',
  async () => post.value?.productIds?.length
    ? await $services.products.listByIds(post.value.productIds, locale.value)
    : [],
  { watch: [post, locale] },
)
const { data: translation } = await useAsyncData(
  'blog-translation',
  async () => post.value ? await $services.blog.getBySlug(otherLocale.value, slug.value) : null,
  { watch: [post, otherLocale, slug] },
)
const body = computed(() => sanitizeContent(post.value?.body))
const description = computed(() => post.value?.seoDescription || post.value?.excerpt || t('blog.description'))
const title = computed(() => post.value?.seoTitle || post.value?.title || t('blog.notFound'))
const canonical = computed(() => new URL(localePath(`/blog/${slug.value}`), config.public.siteUrl).toString())
const date = computed(() => post.value?.publishedAt
  ? new Intl.DateTimeFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US', { dateStyle: 'long' }).format(new Date(post.value.publishedAt))
  : '')

useTajSeo({ title: computed(() => post.value ? `${title.value} | ${siteName.value}` : t('blog.notFound')), description: computed(() => contentAsText(description.value)) })
useSeoMeta({
  ogType: 'article',
  ogImage: () => post.value?.coverImageUrl || undefined,
  twitterCard: 'summary_large_image',
  twitterImage: () => post.value?.coverImageUrl || undefined,
  articlePublishedTime: () => post.value?.publishedAt || undefined,
  articleModifiedTime: () => post.value?.updatedAt || undefined,
  robots: () => post.value ? 'index,follow' : 'noindex,follow',
})
useHead({
  link: () => post.value ? [
    { rel: 'canonical', href: canonical.value },
    ...(translation.value ? [
      { rel: 'alternate' as const, hreflang: locale.value, href: canonical.value },
      { rel: 'alternate' as const, hreflang: otherLocale.value, href: new URL(`/${otherLocale.value}/blog/${slug.value}`, config.public.siteUrl).toString() },
    ] : []),
  ] : [],
  script: () => post.value ? [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.value.title,
      description: contentAsText(description.value),
      image: post.value.coverImageUrl || undefined,
      datePublished: post.value.publishedAt,
      dateModified: post.value.updatedAt,
      inLanguage: locale.value,
      mainEntityOfPage: canonical.value,
      publisher: { '@type': 'Organization', name: siteName.value },
    }).replace(/</g, '\\u003c'),
  }] : [],
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <NuxtLink :to="localePath('/blog')" class="text-sm font-semibold text-brown hover:underline">{{ $t('blog.back') }}</NuxtLink>
    <div v-if="pending" class="mx-auto mt-10 max-w-4xl"><BaseSkeleton class="h-12" /><BaseSkeleton class="mt-6 h-80 rounded-[2rem]" /></div>
    <BaseEmptyState v-else-if="error || !post" class="mt-10" :title="$t('blog.notFound')" />
    <template v-else>
      <article class="mx-auto max-w-4xl">
        <header class="pb-8 pt-10 text-center">
          <div class="flex items-center justify-center gap-3 text-xs font-semibold text-muted"><NuxtLink v-if="post.category" :to="localePath({ path: '/blog', query: { category: post.category } })" class="text-gold hover:underline">{{ post.category }}</NuxtLink><time v-if="date" :datetime="post.publishedAt ?? undefined">{{ date }}</time></div>
          <h1 class="mt-5 text-3xl font-bold leading-[1.5] text-brown sm:text-5xl">{{ post.title }}</h1>
          <p class="mx-auto mt-5 max-w-2xl text-base leading-9 text-muted">{{ post.excerpt }}</p>
        </header>
        <img v-if="post.coverImageUrl" :src="post.coverImageUrl" :alt="post.title" class="aspect-[1.8] w-full rounded-[2rem] object-cover">
        <div class="mx-auto mt-12 max-w-3xl text-base leading-9 text-charcoal [&_a]:font-semibold [&_a]:text-brown [&_a]:underline [&_blockquote]:my-6 [&_blockquote]:border-s-4 [&_blockquote]:border-gold [&_blockquote]:bg-[#f5faf6] [&_blockquote]:p-5 [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-bold [&_img]:my-7 [&_img]:max-w-full [&_img]:rounded-2xl [&_li]:ms-6 [&_li]:list-disc [&_ol_li]:list-decimal [&_p+p]:mt-5" v-html="body" />
      </article>
      <section v-if="attachedProducts?.length" class="mt-16 rounded-[2rem] border border-border bg-[#f5faf6] p-5 sm:p-8">
        <div class="mb-7">
          <p class="text-sm font-bold text-gold">{{ $t('blog.attachedProductsEyebrow') }}</p>
          <h2 class="mt-2 text-2xl font-bold text-brown sm:text-3xl">{{ $t('blog.attachedProducts') }}</h2>
          <p class="mt-2 text-sm leading-7 text-muted">{{ $t('blog.attachedProductsDescription') }}</p>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <StorefrontProductCard v-for="product in attachedProducts" :key="product.id" :product="product" />
        </div>
      </section>
      <div class="mx-auto mt-14 flex max-w-4xl flex-wrap items-center justify-between gap-4 border-y border-border py-7"><p class="font-bold text-brown">{{ $t('blog.exploreShop') }}</p><NuxtLink :to="localePath('/products')" class="rounded-full bg-brown px-6 py-3 text-sm font-bold text-white">{{ $t('actions.explore') }}</NuxtLink></div>
      <section v-if="related?.length" class="mt-16"><h2 class="mb-7 text-2xl font-bold text-brown">{{ $t('blog.related') }}</h2><div class="grid gap-5 md:grid-cols-3"><StorefrontBlogCard v-for="item in related" :key="item.id" :post="item" /></div></section>
    </template>
  </div>
</template>
