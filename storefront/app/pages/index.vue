<script setup lang="ts">
import HomeStory from '~/components/storefront/HomeStory.vue'
import { homeCollectionSlugs } from '~/constants/homeCollections'

const { t, locale } = useI18n()
const { $services } = useNuxtApp()
const localePath = useLocalePath()

const { data, pending, error } = await useAsyncData(
  'home-catalog',
  () => Promise.all([
    $services.categories.listTree(locale.value),
    $services.products.listFeatured(locale.value, 8),
    $services.products.listOnSale(locale.value, 8),
    // Vendure paginates variants, not products. Fetch enough variants to fill
    // the shelf even when each selected product has several pack sizes.
    $services.categories.getBySlug(homeCollectionSlugs.popular, locale.value, { skip: 0, take: 48 }),
  ]),
  { watch: [locale] },
)

const categories = computed(() => data.value?.[0] ?? [])
const products = computed(() => data.value?.[1] ?? [])
const saleProducts = computed(() => data.value?.[2] ?? [])
const popularProducts = computed(() => data.value?.[3]?.products.slice(0, 8) ?? [])
useTajSeo({ title: computed(() => t('brand.name')), description: computed(() => t('shop.heroDescription')) })
</script>

<template>
  <div>
    <section class="overflow-hidden border-b border-border bg-white">
      <div class="mx-auto grid max-w-7xl items-center gap-4 px-4 pb-12 pt-10 sm:px-6 lg:min-h-[540px] lg:grid-cols-[.88fr_1.12fr] lg:gap-0 lg:px-8 lg:py-10">
        <div class="relative z-10 max-w-xl py-6 lg:py-12">
          <p class="inline-flex items-center gap-2 rounded-full border border-[#d9e8dc] bg-[#f1f8f2] px-4 py-2 text-xs font-bold text-[#347451]">
            <span class="size-1.5 rounded-full bg-[#4c9a6d]" />{{ $t('shop.eyebrow') }}
          </p>
          <h1 class="mt-6 text-4xl font-bold leading-[1.45] tracking-tight text-charcoal sm:text-5xl lg:text-[3.45rem]">{{ $t('shop.heroTitle') }}</h1>
          <p class="mt-5 max-w-lg text-base leading-9 text-muted">{{ $t('shop.heroDescription') }}</p>
          <div class="mt-8 flex flex-wrap gap-3">
            <NuxtLink :to="localePath('/products')" class="inline-flex items-center gap-3 rounded-full bg-brown px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_22px_rgb(21_59_52/16%)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#2d745b]">
              {{ $t('actions.explore') }}
              <svg viewBox="0 0 24 24" class="size-4 rtl:-scale-x-100" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </NuxtLink>
            <NuxtLink :to="localePath('/categories')" class="inline-flex items-center rounded-full border border-border px-6 py-3.5 text-sm font-bold text-brown transition hover:border-brown/35 hover:bg-cream">{{ $t('shop.collections') }}</NuxtLink>
          </div>
          <div class="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-muted">
            <span v-for="flavour in ['heroNut', 'heroDried', 'heroChocolate']" :key="flavour" class="inline-flex items-center gap-2"><span class="size-1.5 rounded-full bg-gold" />{{ $t(`shop.${flavour}`) }}</span>
          </div>
        </div>

        <div class="relative min-h-[290px] overflow-hidden rounded-[2rem] bg-white sm:min-h-[390px] lg:-ms-12 lg:h-[480px] lg:rounded-none">
          <img src="/images/nuts-hero.jpg" :alt="$t('shop.heroImageAlt')" class="absolute inset-0 h-full w-full scale-x-[-1] object-cover object-center" fetchpriority="high" />
          <div class="absolute bottom-5 end-5 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-soft backdrop-blur-sm sm:bottom-8 sm:end-8">
            <p class="text-[11px] font-semibold text-gold">{{ $t('shop.heroLabel') }}</p>
            <p class="mt-1 text-sm font-bold text-brown">{{ $t('shop.heroNut') }} · {{ $t('shop.heroDried') }} · {{ $t('shop.heroChocolate') }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p class="text-xs font-bold tracking-[0.12em] text-gold">{{ $t('shop.discover') }}</p><h2 class="mt-2 text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">{{ $t('shop.collections') }}</h2><p class="mt-2 text-sm text-muted">{{ $t('shop.collectionsDescription') }}</p></div>
        <NuxtLink :to="localePath('/categories')" class="inline-flex items-center gap-2 text-sm font-bold text-brown transition hover:text-[#2d745b]">{{ $t('actions.viewAll') }}<svg viewBox="0 0 24 24" class="size-4 rtl:-scale-x-100" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></NuxtLink>
      </div>
      <div v-if="pending" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><BaseSkeleton v-for="item in 3" :key="item" class="h-64 rounded-[1.5rem]" /></div>
      <div v-else-if="error" class="rounded-2xl border border-danger/20 bg-red-50 p-5 text-sm text-danger">{{ $t('errors.generic') }}</div>
      <div v-else-if="categories.length" class="grid gap-4 sm:grid-cols-2" :class="categories.length >= 3 ? 'lg:grid-cols-3' : categories.length === 1 ? 'lg:max-w-xl' : ''"><StorefrontCategoryCard v-for="(category, index) in categories.slice(0, 3)" :key="category.id" :category="category" :index="index" /></div>
      <BaseEmptyState v-else :title="$t('states.empty')" :description="$t('shop.noCategories')" />
    </section>

    <section class="border-y border-border bg-[#f8fbf9]">
      <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p class="text-xs font-bold tracking-[0.12em] text-gold">{{ $t('shop.selectedForYou') }}</p><h2 class="mt-2 text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">{{ $t('shop.featured') }}</h2><p class="mt-2 text-sm text-muted">{{ $t('shop.featuredDescription') }}</p></div>
          <NuxtLink :to="localePath('/products')" class="inline-flex items-center gap-2 text-sm font-bold text-brown transition hover:text-[#2d745b]">{{ $t('actions.viewAll') }}<svg viewBox="0 0 24 24" class="size-4 rtl:-scale-x-100" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></NuxtLink>
        </div>
        <div v-if="pending" class="grid grid-cols-2 gap-4 md:grid-cols-4"><BaseSkeleton v-for="item in 8" :key="item" class="h-72 rounded-2xl" /></div>
        <div v-else-if="error" class="rounded-2xl border border-danger/20 bg-red-50 p-5 text-sm text-danger">{{ $t('errors.generic') }}</div>
        <div v-else-if="products.length" class="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4"><StorefrontProductCard v-for="product in products" :key="product.id" :product="product" /></div>
        <BaseEmptyState v-else :title="$t('states.empty')" :description="$t('shop.noProducts')" />
      </div>
    </section>

    <section v-if="popularProducts.length" class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p class="text-xs font-bold tracking-[0.12em] text-gold">{{ $t('shop.popularEyebrow') }}</p><h2 class="mt-2 text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">{{ $t('shop.popularProducts') }}</h2><p class="mt-2 text-sm text-muted">{{ $t('shop.popularDescription') }}</p></div>
        <NuxtLink :to="localePath(`/categories/${homeCollectionSlugs.popular}`)" class="inline-flex items-center gap-2 text-sm font-bold text-brown transition hover:text-[#2d745b]">{{ $t('actions.viewAll') }}<svg viewBox="0 0 24 24" class="size-4 rtl:-scale-x-100" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></NuxtLink>
      </div>
      <div class="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4"><StorefrontProductCard v-for="product in popularProducts" :key="product.id" :product="product" /></div>
    </section>

    <section v-if="saleProducts.length" class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p class="text-xs font-bold tracking-[0.12em] text-gold">{{ $t('shop.specialOffers') }}</p><h2 class="mt-2 text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">{{ $t('shop.saleProducts') }}</h2></div>
        <NuxtLink :to="localePath('/products')" class="text-sm font-bold text-brown">{{ $t('actions.viewAll') }}</NuxtLink>
      </div>
      <div class="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4"><StorefrontProductCard v-for="product in saleProducts" :key="product.id" :product="product" /></div>
    </section>

    <HomeStory />
  </div>
</template>
