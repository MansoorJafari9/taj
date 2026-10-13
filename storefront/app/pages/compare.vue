<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { ProductSummary, ProductVariantSummary } from '~/types/product'
import { productPath } from '~/services/api/products.service'
import { formatPrice } from '~/utils/formatPrice'
import { salePrice } from '~/utils/salePrice'

const saved = useSavedProductsStore()
const { compareIds } = storeToRefs(saved)
const { $services } = useNuxtApp()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const siteName = useSiteName()
const ids = computed(() => compareIds.value.join(','))
const { data: products, pending, error } = await useAsyncData(
  'comparison-products',
  () => $services.products.listByIds(compareIds.value, locale.value),
  { watch: [ids, locale] },
)
const tableWidth = computed(() => `${Math.max(680, 160 + (products.value?.length ?? 0) * 220)}px`)

function currentPrice(variant: ProductVariantSummary) {
  return salePrice(variant) ?? variant.priceWithTax
}
function bestVariant(product: ProductSummary) {
  const available = product.variants.filter(variant => variant.stockLevel !== 'OUT_OF_STOCK')
  return [...(available.length ? available : product.variants)].sort((a, b) => currentPrice(a) - currentPrice(b))[0]
}
function price(variant: ProductVariantSummary) {
  return formatPrice(currentPrice(variant), variant.currencyCode, locale.value)
}

useTajSeo({ title: computed(() => `${t('saved.compareTitle')} | ${siteName.value}`), description: computed(() => t('saved.compareDescription')) })
useSeoMeta({ robots: 'noindex,follow' })
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <p class="text-xs font-bold tracking-[0.16em] text-gold">{{ $t('saved.eyebrow') }}</p>
    <h1 class="mt-3 text-3xl font-bold text-brown sm:text-4xl">{{ $t('saved.compareTitle') }}</h1>
    <p class="mt-3 max-w-2xl leading-8 text-muted">{{ $t('saved.compareDescription') }}</p>
    <button v-if="compareIds.length" type="button" class="mt-5 text-sm font-semibold text-muted underline underline-offset-4 hover:text-danger" @click="saved.clearCompare()">{{ $t('saved.clearCompare') }}</button>
    <div v-if="!saved.hydrated || pending" class="mt-9 grid grid-cols-2 gap-4 md:grid-cols-4"><BaseSkeleton v-for="n in 4" :key="n" class="h-72 rounded-2xl" /></div>
    <div v-else-if="error" class="mt-9 rounded-2xl border border-danger/20 bg-red-50 p-5 text-danger">{{ $t('errors.generic') }}</div>
    <div v-else-if="!products?.length" class="mt-10 rounded-[2rem] border border-border bg-[#f5faf6] px-6 py-14 text-center">
      <h2 class="text-xl font-bold text-brown">{{ $t('saved.compareEmpty') }}</h2>
      <p class="mt-3 text-sm text-muted">{{ $t('saved.compareEmptyDescription') }}</p>
      <NuxtLink :to="localePath('/products')" class="mt-6 inline-flex rounded-full bg-brown px-6 py-3 text-sm font-bold text-white">{{ $t('actions.explore') }}</NuxtLink>
    </div>
    <template v-else>
      <p v-if="products.length === 1" class="mt-8 rounded-xl bg-cream px-4 py-3 text-sm text-brown">{{ $t('saved.addAnother') }} <NuxtLink :to="localePath('/products')" class="font-bold underline">{{ $t('actions.explore') }}</NuxtLink></p>
      <div class="mt-9 overflow-x-auto rounded-[1.5rem] border border-border bg-white shadow-sm">
        <table class="w-full table-fixed border-collapse text-start" :style="{ minWidth: tableWidth }">
          <thead>
            <tr class="align-top">
              <th scope="col" class="sticky start-0 z-10 w-36 border-b border-e border-border bg-[#f5faf6] p-4 text-start text-sm text-brown">{{ $t('saved.compareRow') }}</th>
              <th v-for="product in products" :key="product.id" scope="col" class="border-b border-e border-border p-4 text-start last:border-e-0">
                <div class="flex justify-end"><button type="button" class="text-xs font-semibold text-muted hover:text-danger" :aria-label="$t('saved.removeCompareProduct', { name: product.name })" @click="saved.toggleCompare(product.id)">{{ $t('shop.remove') }} ×</button></div>
                <NuxtLink :to="localePath(productPath(product))" class="mt-1 block">
                  <NuxtImg v-if="product.featuredAsset?.preview" :src="product.featuredAsset.preview" :alt="product.name" class="mx-auto aspect-square h-32 rounded-xl object-cover" sizes="128px" />
                  <div v-else class="mx-auto size-32 rounded-xl bg-cream" />
                  <span class="mt-3 block min-h-12 text-sm font-bold leading-6 text-charcoal hover:text-brown">{{ product.name }}</span>
                </NuxtLink>
                <NuxtLink :to="localePath(productPath(product))" class="mt-3 inline-flex rounded-full bg-brown px-4 py-2 text-xs font-bold text-white">{{ $t('saved.viewAndBuy') }}</NuxtLink>
              </th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr class="align-top">
              <th scope="row" class="sticky start-0 z-10 border-b border-e border-border bg-[#f5faf6] p-4 text-start font-bold text-brown">{{ $t('saved.startingPrice') }}</th>
              <td v-for="product in products" :key="product.id" class="border-b border-e border-border p-4 font-bold text-brown last:border-e-0">{{ bestVariant(product) ? price(bestVariant(product)!) : '—' }}</td>
            </tr>
            <tr class="align-top">
              <th scope="row" class="sticky start-0 z-10 border-b border-e border-border bg-[#f5faf6] p-4 text-start font-bold text-brown">{{ $t('saved.weightOptions') }}</th>
              <td v-for="product in products" :key="product.id" class="border-b border-e border-border p-4 last:border-e-0">
                <ul class="space-y-2"><li v-for="variant in product.variants" :key="variant.id" class="rounded-xl bg-[#f5faf6] p-3"><span class="block font-semibold text-charcoal">{{ variant.name }}</span><span class="mt-1 block text-brown">{{ price(variant) }}</span><span class="mt-1 block text-xs" :class="variant.stockLevel === 'OUT_OF_STOCK' ? 'text-danger' : 'text-success'">{{ variant.stockLevel === 'OUT_OF_STOCK' ? $t('shop.unavailable') : $t('shop.availability') }}</span></li></ul>
              </td>
            </tr>
            <tr class="align-top">
              <th scope="row" class="sticky start-0 z-10 border-e border-border bg-[#f5faf6] p-4 text-start font-bold text-brown">{{ $t('saved.discount') }}</th>
              <td v-for="product in products" :key="product.id" class="border-e border-border p-4 last:border-e-0">{{ product.variants.some(variant => variant.saleOffer) ? $t('saved.hasDiscount') : $t('saved.noDiscount') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-3 text-xs text-muted">{{ $t('saved.compareHint') }}</p>
    </template>
  </div>
</template>
