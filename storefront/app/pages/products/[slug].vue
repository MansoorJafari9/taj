<script setup lang="ts">
import { sanitizeContent } from '~/utils/sanitizeContent'
import { formatPrice } from '~/utils/formatPrice'
import { OrderMutationError } from '~/services/api/orders.service'
import { salePrice } from '~/utils/salePrice'
import { chooseVariantOption, getOptionVariants, getVariantOptionGroups } from '~/utils/variantOptions'

const route = useRoute()
const { t, locale } = useI18n()
const { $services } = useNuxtApp()
const localePath = useLocalePath()
const siteName = useSiteName()
const cart = useCartStore()
const slug = computed(() => String(route.params.slug))
const selectedVariantId = ref<string>()
const quantity = ref(1)
const adding = ref(false)
const addError = ref('')
const added = ref(false)

const { data: product, pending, error } = await useAsyncData(
  () => `product-detail:${locale.value}:${slug.value}`,
  () => $services.products.getByIdentifier(slug.value, locale.value),
)
const { data: relatedProducts, pending: relatedPending } = await useAsyncData(
  () => `product-related:${locale.value}:${slug.value}`,
  async () => product.value ? await $services.products.listRelated(product.value, locale.value, 4) : [],
  { watch: [product] },
)
watch(product, value => {
  selectedVariantId.value = value?.variants.find(variant => variant.saleOffer && variant.stockLevel !== 'OUT_OF_STOCK')?.id
    ?? value?.variants.find(variant => variant.stockLevel !== 'OUT_OF_STOCK')?.id
    ?? value?.variants[0]?.id
  quantity.value = 1
  addError.value = ''
  added.value = false
}, { immediate: true })
watch(selectedVariantId, () => {
  quantity.value = 1
  addError.value = ''
  added.value = false
})
const selectedVariant = computed(() => product.value?.variants.find(variant => variant.id === selectedVariantId.value) ?? product.value?.variants[0])
const optionGroups = computed(() => product.value ? getVariantOptionGroups(product.value.optionGroups, product.value.variants) : [])
const optionRows = computed(() => optionGroups.value.map((group, groupIndex) => ({
  ...group,
  options: group.options.map(option => {
    const variants = getOptionVariants(product.value?.variants ?? [], optionGroups.value, selectedVariant.value, groupIndex, option.id)
    return {
      ...option,
      selected: selectedVariant.value?.options.some(value => value.id === option.id) ?? false,
      disabled: !variants.length,
      outOfStock: variants.length > 0 && variants.every(variant => variant.stockLevel === 'OUT_OF_STOCK'),
    }
  }),
})))

function selectOption(groupIndex: number, optionId: string) {
  const variant = chooseVariantOption(product.value?.variants ?? [], optionGroups.value, selectedVariant.value, groupIndex, optionId)
  if (variant) selectedVariantId.value = variant.id
}
const safeDescription = computed(() => sanitizeContent(product.value?.description))
const formattedPrice = computed(() => selectedVariant.value ? formatPrice(selectedVariant.value.priceWithTax, selectedVariant.value.currencyCode, locale.value) : '')
const discountedPrice = computed(() => selectedVariant.value ? salePrice(selectedVariant.value) : null)
const formattedDiscountedPrice = computed(() => selectedVariant.value && discountedPrice.value !== null ? formatPrice(discountedPrice.value, selectedVariant.value.currencyCode, locale.value) : '')
const canAdd = computed(() => selectedVariant.value && selectedVariant.value.stockLevel !== 'OUT_OF_STOCK' && !adding.value)

async function addToCart() {
  if (!selectedVariant.value || !canAdd.value) return
  adding.value = true
  addError.value = ''
  added.value = false
  try {
    await cart.addItem($services.orders, selectedVariant.value.id, quantity.value)
    added.value = true
  } catch (error) {
    addError.value = error instanceof OrderMutationError && error.code === 'INSUFFICIENT_STOCK_ERROR'
      ? t(error.quantityAvailable ? 'shop.partialStockAdded' : 'shop.insufficientStock')
      : t('errors.generic')
  } finally {
    adding.value = false
  }
}
useTajSeo({ title: computed(() => product.value ? `${product.value.name} | ${siteName.value}` : t('shop.productNotFound')), description: computed(() => product.value?.description || t('shop.productsDescription')) })
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <NuxtLink :to="localePath('/products')" class="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-brown"><svg viewBox="0 0 24 24" class="size-4 rtl:scale-x-[-1]" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 12H5m6-6-6 6 6 6" /></svg>{{ $t('actions.back') }}</NuxtLink>
    <div v-if="pending" class="mt-8 grid gap-10 lg:grid-cols-2"><BaseSkeleton class="aspect-square rounded-[2rem]" /><div><BaseSkeleton class="h-8 max-w-sm" /><BaseSkeleton class="mt-5 h-24" /></div></div>
    <BaseEmptyState v-else-if="error || !product" class="mt-8" :title="$t('states.empty')" :description="$t('shop.productNotFound')" />
    <section v-else class="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div class="overflow-hidden rounded-[2rem] border border-border bg-cream">
        <NuxtImg v-if="product.featuredAsset?.preview" :src="product.featuredAsset.preview" :alt="product.name" class="aspect-square size-full object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
        <div v-else class="aspect-square bg-[linear-gradient(145deg,#e0f0e2,#8cbe9a)]" />
      </div>
      <div class="self-center">
        <p class="text-xs font-bold tracking-[0.16em] text-gold">{{ $t('navigation.products') }}</p>
        <h1 class="mt-3 text-3xl font-bold tracking-tight text-brown sm:text-5xl">{{ product.name }}</h1>
        <div v-if="safeDescription" class="mt-6 max-w-xl leading-8 text-muted [&_a]:text-brown [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-s-2 [&_blockquote]:border-border [&_blockquote]:ps-4 [&_h2]:font-bold [&_h3]:font-bold [&_li]:ms-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p+p]:mt-3" v-html="safeDescription" />
        <div class="mt-8 border-y border-border py-6">
          <div v-if="optionRows.length" class="space-y-6">
            <fieldset v-for="(group, groupIndex) in optionRows" :key="group.id" :disabled="adding" class="min-w-0">
              <legend class="text-sm font-bold text-brown">{{ group.name }}</legend>
              <div class="mt-3 flex flex-wrap gap-2">
                <button
                  v-for="option in group.options"
                  :key="option.id"
                  type="button"
                  :aria-pressed="option.selected"
                  :disabled="option.disabled"
                  class="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown disabled:cursor-not-allowed disabled:opacity-40"
                  :class="option.selected ? 'border-brown bg-brown text-off-white' : 'border-border text-brown hover:border-brown'"
                  @click="selectOption(groupIndex, option.id)"
                >
                  {{ option.name }}
                  <span v-if="option.outOfStock" class="text-xs opacity-75">({{ $t('shop.unavailable') }})</span>
                </button>
              </div>
            </fieldset>
          </div>
          <template v-else>
            <p class="text-xs font-bold tracking-[0.16em] text-muted">{{ $t('shop.variants') }}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <button v-for="variant in product.variants" :key="variant.id" type="button" :disabled="adding" :aria-pressed="selectedVariant?.id === variant.id" class="rounded-full border px-4 py-2 text-sm transition disabled:opacity-40" :class="selectedVariant?.id === variant.id ? 'border-brown bg-brown text-off-white' : 'border-border text-brown hover:border-brown'" @click="selectedVariantId = variant.id">{{ variant.name }}</button>
            </div>
          </template>
        </div>
        <div class="mt-6 flex items-end justify-between gap-4">
          <div><p class="text-sm text-muted">{{ $t('shop.price') }}</p><span v-if="discountedPrice !== null" class="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-success">{{ $t('shop.salePercent', { percent: selectedVariant?.saleOffer?.percentage }) }}</span><p v-if="discountedPrice !== null" class="mt-2 text-sm text-muted"><del>{{ formattedPrice }}</del></p><p class="mt-1 text-3xl font-bold tracking-tight text-brown">{{ formattedDiscountedPrice || formattedPrice }}</p></div>
          <span v-if="selectedVariant" class="rounded-full px-3 py-1.5 text-xs font-semibold" :class="selectedVariant.stockLevel === 'OUT_OF_STOCK' ? 'bg-red-50 text-danger' : 'bg-emerald-50 text-success'">{{ selectedVariant.stockLevel === 'OUT_OF_STOCK' ? $t('shop.unavailable') : $t('shop.availability') }}</span>
        </div>
        <div v-if="selectedVariant" class="mt-8 flex flex-wrap items-end gap-3">
          <div>
            <p id="product-quantity-label" class="mb-2 text-sm font-semibold text-charcoal">{{ $t('shop.quantity') }}</p>
            <div class="inline-flex h-12 items-center overflow-hidden rounded-full border border-border bg-white">
              <button type="button" class="grid h-12 w-12 place-items-center text-xl text-brown transition hover:bg-cream disabled:opacity-40" :disabled="quantity <= 1 || adding" :aria-label="$t('shop.decreaseQuantity')" @click="quantity--">−</button>
              <output aria-labelledby="product-quantity-label" class="min-w-9 text-center text-sm font-bold tabular-nums">{{ quantity }}</output>
              <button type="button" class="grid h-12 w-12 place-items-center text-xl text-brown transition hover:bg-cream disabled:opacity-40" :disabled="quantity >= 99 || adding" :aria-label="$t('shop.increaseQuantity')" @click="quantity++">+</button>
            </div>
          </div>
          <BaseButton class="h-12 min-w-48 rounded-full px-8" :loading="adding" :disabled="!canAdd" @click="addToCart">{{ $t('shop.addToCart') }}</BaseButton>
        </div>
        <div class="mt-5"><StorefrontProductSaveActions :product-id="product.id" /></div>
        <div class="mt-4 min-h-7 text-sm" aria-live="polite">
          <p v-if="addError" class="font-medium text-danger">{{ addError }}</p>
          <p v-else-if="added" class="font-medium text-success">{{ $t('shop.addedToCart') }} <NuxtLink :to="localePath('/cart')" class="ms-2 underline underline-offset-4">{{ $t('shop.viewCart') }}</NuxtLink></p>
        </div>
      </div>
    </section>

    <section v-if="product && !relatedPending && relatedProducts?.length" class="mt-20 border-t border-border pt-12 sm:mt-24 sm:pt-16">
      <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p class="text-xs font-bold tracking-[0.12em] text-gold">{{ $t('shop.relatedEyebrow') }}</p><h2 class="mt-2 text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">{{ $t('shop.relatedProducts') }}</h2><p class="mt-2 text-sm text-muted">{{ $t('shop.relatedDescription') }}</p></div>
        <NuxtLink :to="localePath('/products')" class="text-sm font-bold text-brown transition hover:text-[#2d745b]">{{ $t('actions.viewAll') }}</NuxtLink>
      </div>
      <div class="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"><StorefrontProductCard v-for="related in relatedProducts" :key="related.id" :product="related" /></div>
    </section>
  </div>
</template>
