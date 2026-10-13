<script setup lang="ts">
import { storeToRefs } from 'pinia'

const saved = useSavedProductsStore()
const { favoriteIds } = storeToRefs(saved)
const { $services } = useNuxtApp()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const siteName = useSiteName()
const ids = computed(() => favoriteIds.value.join(','))
const { data: products, pending, error } = await useAsyncData(
  'favorite-products',
  () => $services.products.listByIds(favoriteIds.value, locale.value),
  { watch: [ids, locale] },
)

useTajSeo({ title: computed(() => `${t('saved.favoritesTitle')} | ${siteName.value}`), description: computed(() => t('saved.favoritesDescription')) })
useSeoMeta({ robots: 'noindex,follow' })
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <p class="text-xs font-bold tracking-[0.16em] text-gold">{{ $t('saved.eyebrow') }}</p>
    <h1 class="mt-3 text-3xl font-bold text-brown sm:text-4xl">{{ $t('saved.favoritesTitle') }}</h1>
    <p class="mt-3 max-w-2xl leading-8 text-muted">{{ $t('saved.favoritesDescription') }}</p>
    <button v-if="favoriteIds.length" type="button" class="mt-5 text-sm font-semibold text-muted underline underline-offset-4 hover:text-danger" @click="saved.clearFavorites()">{{ $t('saved.clearFavorites') }}</button>
    <div v-if="!saved.hydrated || pending" class="mt-9 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"><BaseSkeleton v-for="n in 4" :key="n" class="h-72 rounded-2xl" /></div>
    <div v-else-if="error" class="mt-9 rounded-2xl border border-danger/20 bg-red-50 p-5 text-danger">{{ $t('errors.generic') }}</div>
    <div v-else-if="products?.length" class="mt-9 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"><StorefrontProductCard v-for="product in products" :key="product.id" :product="product" /></div>
    <div v-else class="mt-10 rounded-[2rem] border border-border bg-[#f5faf6] px-6 py-14 text-center">
      <h2 class="text-xl font-bold text-brown">{{ $t('saved.favoritesEmpty') }}</h2>
      <p class="mt-3 text-sm text-muted">{{ $t('saved.favoritesEmptyDescription') }}</p>
      <NuxtLink :to="localePath('/products')" class="mt-6 inline-flex rounded-full bg-brown px-6 py-3 text-sm font-bold text-white">{{ $t('actions.explore') }}</NuxtLink>
    </div>
  </div>
</template>
