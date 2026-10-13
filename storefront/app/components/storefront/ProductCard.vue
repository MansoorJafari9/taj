<script setup lang="ts">
import type { ProductSummary } from '~/types/product'
import { productPath } from '~/services/api/products.service'
import { formatPrice } from '~/utils/formatPrice'
import { salePrice } from '~/utils/salePrice'

const props = defineProps<{ product: ProductSummary }>()
const localePath = useLocalePath()
const { locale } = useI18n()

const primaryVariant = computed(() => props.product.variants.find(variant => variant.saleOffer && variant.stockLevel !== 'OUT_OF_STOCK') ?? props.product.variants[0])
const discountedPrice = computed(() => primaryVariant.value ? salePrice(primaryVariant.value) : null)
const formattedPrice = computed(() => {
  if (!primaryVariant.value) return ''
  return formatPrice(primaryVariant.value.priceWithTax, primaryVariant.value.currencyCode, locale.value)
})
const formattedDiscountedPrice = computed(() => primaryVariant.value && discountedPrice.value !== null
  ? formatPrice(discountedPrice.value, primaryVariant.value.currencyCode, locale.value)
  : '')
</script>

<template>
  <article class="group relative min-w-0 overflow-hidden rounded-[1.35rem] border border-border bg-white transition duration-300 hover:-translate-y-1 hover:border-[#c8dccf] hover:shadow-soft">
    <div class="absolute start-2 top-2 z-10 sm:start-3 sm:top-3"><StorefrontProductSaveActions :product-id="product.id" compact /></div>
    <NuxtLink :to="localePath(productPath(product))" class="relative block overflow-hidden bg-cream">
      <span v-if="discountedPrice !== null" class="absolute end-3 top-3 z-10 rounded-full bg-brown px-3 py-1 text-xs font-bold text-white">{{ $t('shop.salePercent', { percent: primaryVariant?.saleOffer?.percentage }) }}</span>
      <div class="aspect-square overflow-hidden bg-cream">
        <NuxtImg
          v-if="product.featuredAsset?.preview"
          :src="product.featuredAsset.preview"
          :alt="product.name"
          class="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.055]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
        />
        <div v-else class="flex size-full items-center justify-center text-brown/35">
          <svg viewBox="0 0 24 24" class="size-9" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="m4 16 4.5-4.5L12 15l2.5-2.5L20 18M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2ZM8.5 8.5h.01" /></svg>
        </div>
      </div>
    </NuxtLink>
    <div class="px-4 pb-4 pt-4">
      <p class="mb-1.5 text-[11px] font-medium text-muted">{{ primaryVariant?.name }}</p>
      <NuxtLink :to="localePath(productPath(product))" class="line-clamp-1 text-sm font-bold text-charcoal transition-colors hover:text-brown">{{ product.name }}</NuxtLink>
      <div class="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
        <span v-if="primaryVariant" class="flex flex-col gap-0.5 text-sm font-bold text-brown"><del v-if="discountedPrice !== null" class="text-xs font-normal text-muted">{{ formattedPrice }}</del>{{ formattedDiscountedPrice || formattedPrice }}</span>
        <NuxtLink :to="localePath(productPath(product))" class="grid size-8 place-items-center rounded-full bg-cream text-brown transition group-hover:bg-brown group-hover:text-white" :aria-label="$t('shop.viewProduct', { name: product.name })">
          <svg viewBox="0 0 24 24" class="size-4 rtl:-scale-x-100" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
