<script setup lang="ts">
import { OrderMutationError } from '~/services/api/orders.service'
import { productPath } from '~/services/api/products.service'
import { formatPrice } from '~/utils/formatPrice'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const siteName = useSiteName()
const { $services } = useNuxtApp()
const cart = useCartStore()
const busyLineId = ref<string | null>(null)
const errorMessage = ref('')

async function loadCart() {
  errorMessage.value = ''
  try {
    await cart.refresh($services.orders)
  } catch {
    errorMessage.value = t('errors.generic')
  }
}

onMounted(loadCart)

async function changeQuantity(lineId: string, quantity: number) {
  if (busyLineId.value) return
  busyLineId.value = lineId
  errorMessage.value = ''
  try {
    if (quantity === 0) await cart.removeLine($services.orders, lineId)
    else await cart.adjustLine($services.orders, lineId, quantity)
  } catch (error) {
    errorMessage.value = error instanceof OrderMutationError && error.code === 'INSUFFICIENT_STOCK_ERROR'
      ? t(error.quantityAvailable ? 'shop.partialStockAdded' : 'shop.insufficientStock')
      : t('errors.generic')
  } finally {
    busyLineId.value = null
  }
}

useTajSeo({ title: computed(() => `${t('navigation.cart')} | ${siteName.value}`), description: computed(() => t('shop.emptyCartDescription')) })
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="mb-9 flex flex-wrap items-end justify-between gap-4">
      <div><p class="text-xs font-bold tracking-[0.16em] text-gold">{{ siteName }}</p><h1 class="mt-2 text-3xl font-bold text-brown sm:text-4xl">{{ $t('navigation.cart') }}</h1></div>
      <NuxtLink :to="localePath('/products')" class="text-sm font-semibold text-brown underline decoration-gold underline-offset-4">{{ $t('shop.continueShopping') }}</NuxtLink>
    </div>

    <div v-if="!cart.loaded && !errorMessage" class="grid gap-4"><BaseSkeleton v-for="item in 2" :key="item" class="h-32 rounded-2xl" /></div>
    <div v-else-if="!cart.loaded" class="rounded-2xl border border-danger/20 bg-red-50 p-6 text-sm text-danger">
      <p>{{ errorMessage }}</p>
      <button type="button" class="mt-3 font-bold underline underline-offset-4" @click="loadCart">{{ $t('actions.retry') }}</button>
    </div>
    <div v-else-if="!cart.order?.lines.length" class="rounded-[2rem] border border-border bg-[#f8fbf9] px-6 py-16 text-center">
      <h2 class="text-xl font-bold text-brown">{{ $t('shop.emptyCart') }}</h2>
      <p class="mt-2 text-sm text-muted">{{ $t('shop.emptyCartDescription') }}</p>
      <NuxtLink :to="localePath('/products')" class="mt-6 inline-flex rounded-full bg-brown px-6 py-3 text-sm font-bold text-white">{{ $t('actions.explore') }}</NuxtLink>
    </div>
    <div v-else class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div class="overflow-hidden rounded-[1.5rem] border border-border bg-white">
        <div v-for="line in cart.order.lines" :key="line.id" class="flex gap-4 border-b border-border p-4 last:border-b-0 sm:gap-6 sm:p-6">
          <NuxtLink :to="localePath(productPath(line.productVariant.product))" class="size-24 shrink-0 overflow-hidden rounded-2xl bg-cream sm:size-32">
            <NuxtImg v-if="line.featuredAsset?.preview" :src="line.featuredAsset.preview" :alt="line.productVariant.name" class="size-full object-cover" sizes="128px" />
          </NuxtLink>
          <div class="flex min-w-0 flex-1 flex-col justify-between gap-3">
            <div class="flex items-start justify-between gap-3">
              <div><NuxtLink :to="localePath(productPath(line.productVariant.product))" class="font-bold text-brown hover:underline">{{ line.productVariant.name }}</NuxtLink><p class="mt-1 text-xs text-muted"><del v-if="line.discountedUnitPriceWithTax < line.unitPriceWithTax" class="me-2">{{ formatPrice(line.unitPriceWithTax, cart.order.currencyCode, locale) }}</del>{{ formatPrice(line.discountedUnitPriceWithTax, cart.order.currencyCode, locale) }} {{ $t('shop.perItem') }}</p></div>
              <button type="button" class="text-xs font-semibold text-muted underline underline-offset-4 transition hover:text-danger disabled:opacity-50" :disabled="!!busyLineId" @click="changeQuantity(line.id, 0)">{{ $t('shop.remove') }}</button>
            </div>
            <div class="flex flex-wrap items-end justify-between gap-3">
              <div class="inline-flex h-10 items-center overflow-hidden rounded-full border border-border">
                <button type="button" class="grid size-10 place-items-center text-lg text-brown hover:bg-cream disabled:opacity-40" :disabled="!!busyLineId" :aria-label="$t('shop.decreaseQuantity')" @click="changeQuantity(line.id, line.quantity - 1)">−</button>
                <span class="min-w-8 text-center text-sm font-bold tabular-nums">{{ line.quantity }}</span>
                <button type="button" class="grid size-10 place-items-center text-lg text-brown hover:bg-cream disabled:opacity-40" :disabled="!!busyLineId || line.quantity >= 99" :aria-label="$t('shop.increaseQuantity')" @click="changeQuantity(line.id, line.quantity + 1)">+</button>
              </div>
              <p class="font-bold text-brown">{{ formatPrice(line.discountedLinePriceWithTax, cart.order.currencyCode, locale) }}</p>
            </div>
          </div>
        </div>
      </div>
      <aside class="rounded-[1.5rem] border border-border bg-[#f8fbf9] p-6 lg:sticky lg:top-40">
        <h2 class="text-lg font-bold text-brown">{{ $t('shop.orderSummary') }}</h2>
        <div class="mt-6 flex items-center justify-between border-t border-border pt-5 text-sm"><span class="text-muted">{{ $t('shop.itemsCount', { count: cart.itemCount }) }}</span><span class="font-bold text-brown">{{ formatPrice(cart.order.totalWithTax, cart.order.currencyCode, locale) }}</span></div>
        <NuxtLink :to="localePath('/checkout')" class="mt-6 flex w-full items-center justify-center rounded-full bg-brown px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#2d745b]">{{ locale === 'fa' ? 'ادامه و تسویه حساب' : 'Continue to checkout' }}</NuxtLink>
        <p class="mt-3 text-xs leading-6 text-muted">{{ locale === 'fa' ? 'برای ثبت سفارش و پرداخت باید وارد حساب شوید.' : 'Sign in is required to place and pay for an order.' }}</p>
      </aside>
    </div>
    <p v-if="errorMessage" role="alert" class="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">{{ errorMessage }}</p>
  </div>
</template>
