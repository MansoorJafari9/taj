<script setup lang="ts">
import { contentAsText, sanitizeContent } from '~/utils/sanitizeContent'

const route = useRoute()
const { t, locale } = useI18n()
const { $services } = useNuxtApp()
const localePath = useLocalePath()
const siteName = useSiteName()
const slug = computed(() => String(route.params.slug))

const { data: category, pending, error } = await useAsyncData(
  'collection-detail',
  () => $services.categories.getBySlug(slug.value, locale.value, { skip: 0, take: 100 }),
  { watch: [slug, locale] },
)
const safeDescription = computed(() => sanitizeContent(category.value?.description))
useTajSeo({ title: computed(() => category.value ? `${category.value.name} | ${siteName.value}` : t('shop.categoryNotFound')), description: computed(() => contentAsText(category.value?.description) || t('shop.categoriesDescription')) })
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <NuxtLink :to="localePath('/categories')" class="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-brown"><svg viewBox="0 0 24 24" class="size-4 rtl:scale-x-[-1]" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 12H5m6-6-6 6 6 6" /></svg>{{ $t('actions.back') }}</NuxtLink>
    <div v-if="pending" class="mt-8"><BaseSkeleton class="h-12 max-w-md" /><BaseSkeleton class="mt-4 h-6 max-w-2xl" /></div>
    <div v-else-if="error || !category" class="mt-8"><BaseEmptyState :title="$t('states.empty')" :description="$t('shop.categoryNotFound')" /></div>
    <template v-else>
      <section class="mt-8 overflow-hidden rounded-[2rem] border border-border bg-cream"><div class="grid md:grid-cols-[1fr_.7fr]"><div class="p-7 sm:p-10 lg:p-14"><p class="text-xs font-bold tracking-[0.16em] text-gold">{{ $t('navigation.categories') }}</p><h1 class="mt-3 text-3xl font-bold tracking-tight text-brown sm:text-5xl">{{ category.name }}</h1><div v-if="safeDescription" class="mt-5 max-w-xl leading-8 text-muted [&_a]:text-brown [&_a]:underline [&_h2]:font-bold [&_h3]:font-bold [&_li]:ms-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p+p]:mt-3" v-html="safeDescription" /></div><NuxtImg v-if="category.featuredAsset?.preview" :src="category.featuredAsset.preview" :alt="category.name" class="h-64 w-full object-cover md:h-full" sizes="(max-width: 768px) 100vw, 40vw" /><div v-else class="min-h-64 bg-[linear-gradient(135deg,#e0f0e2,#8cbe9a)]" /></div></section>
      <div class="mt-14 flex items-end justify-between border-b border-border pb-4"><div><p class="text-xs font-bold tracking-[0.16em] text-gold">{{ $t('shop.collections') }}</p><h2 class="mt-2 text-2xl font-bold tracking-tight text-brown">{{ $t('shop.categoryProducts') }}</h2></div><span class="text-sm text-muted">{{ $t('shop.results', { count: category.products.length }) }}</span></div>
      <BaseEmptyState v-if="!category.products.length" class="mt-8" :title="$t('states.empty')" :description="$t('shop.noProducts')" />
      <div v-else class="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4"><StorefrontProductCard v-for="product in category.products" :key="product.id" :product="product" /></div>
    </template>
  </div>
</template>
