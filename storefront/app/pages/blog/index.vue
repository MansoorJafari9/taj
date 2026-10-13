<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()
const { t, locale } = useI18n()
const { $services } = useNuxtApp()
const config = useRuntimeConfig()
const siteName = useSiteName()
const perPage = 9
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const category = computed(() => typeof route.query.category === 'string' ? route.query.category : '')

const { data, pending, error } = await useAsyncData(
  'blog-list',
  () => $services.blog.list(locale.value, { skip: (page.value - 1) * perPage, take: perPage, ...(category.value ? { category: category.value } : {}) }),
  { watch: [locale, page, category] },
)
const posts = computed(() => data.value?.items ?? [])
const totalPages = computed(() => Math.max(1, Math.ceil((data.value?.totalItems ?? 0) / perPage)))
function pagePath(target: number) {
  return localePath({ path: '/blog', query: { ...(category.value ? { category: category.value } : {}), ...(target > 1 ? { page: String(target) } : {}) } })
}
useTajSeo({ title: computed(() => `${t('blog.title')} | ${siteName.value}`), description: computed(() => t('blog.description')) })
useSeoMeta({ robots: () => posts.value.length ? 'index,follow' : 'noindex,follow' })
useHead({ link: [{ rel: 'canonical', href: computed(() => new URL(pagePath(page.value), config.public.siteUrl).toString()) }] })
</script>

<template>
  <div>
    <section class="border-b border-border bg-[#f5faf6]"><div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"><p class="text-xs font-bold tracking-widest text-gold">{{ $t('blog.eyebrow') }}</p><h1 class="mt-4 text-4xl font-bold leading-tight text-brown sm:text-6xl">{{ $t('blog.title') }}</h1><p class="mt-5 max-w-2xl text-base leading-9 text-muted">{{ $t('blog.description') }}</p></div></section>
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4"><h2 class="text-xl font-bold text-charcoal">{{ category || $t('blog.latest') }}</h2><NuxtLink v-if="category" :to="localePath('/blog')" class="text-sm font-semibold text-brown underline underline-offset-4">{{ $t('blog.all') }}</NuxtLink></div>
      <div v-if="pending" class="grid gap-5 md:grid-cols-2 lg:grid-cols-3"><BaseSkeleton v-for="n in 6" :key="n" class="h-96 rounded-[1.5rem]" /></div>
      <div v-else-if="error" class="rounded-xl border border-danger/20 bg-red-50 p-5 text-danger">{{ $t('errors.generic') }}</div>
      <div v-else-if="posts.length" class="grid gap-5 md:grid-cols-2 lg:grid-cols-3"><StorefrontBlogCard v-for="post in posts" :key="post.id" :post="post" /></div>
      <BaseEmptyState v-else :title="$t('blog.empty')" />
      <nav v-if="totalPages > 1" class="mt-10 flex items-center justify-center gap-4 text-sm font-semibold" :aria-label="$t('blog.title')"><NuxtLink v-if="page > 1" :to="pagePath(page - 1)" class="rounded-full border border-border px-5 py-2">{{ $t('actions.previous') }}</NuxtLink><span>{{ page }} / {{ totalPages }}</span><NuxtLink v-if="page < totalPages" :to="pagePath(page + 1)" class="rounded-full border border-border px-5 py-2">{{ $t('actions.next') }}</NuxtLink></nav>
    </div>
  </div>
</template>
