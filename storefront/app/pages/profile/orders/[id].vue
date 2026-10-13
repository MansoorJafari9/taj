<script setup lang="ts">
import { productPath } from '~/services/api/products.service'
import { formatPrice } from '~/utils/formatPrice'
import { formatOrderDate, orderStatus } from '~/utils/orderStatus'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ robots: 'noindex,nofollow' })

const { $services } = useNuxtApp()
const route = useRoute()
const localePath = useLocalePath()
const auth = useAuthStore()
const { locale } = useI18n()
const isFa = computed(() => locale.value === 'fa')
const id = computed(() => String(route.params.id ?? ''))
const { data: order, pending, error, refresh } = await useAsyncData(
  `profile-order-${auth.customer?.id ?? 'guest'}-${id.value}`,
  () => $services.customerOrders.getById(id.value, locale.value),
  { watch: [id, locale] },
)

const payment = computed(() => order.value?.payments?.find(item => item.state === 'Settled') ?? null)
const trackingCodes = computed(() => [...new Set(order.value?.fulfillments?.map(item => item.trackingCode).filter((value): value is string => !!value) ?? [])])
const progressStep = computed(() => {
  if (!order.value) return 0
  if (order.value.state === 'Delivered') return 4
  if (['Shipped', 'PartiallyShipped', 'PartiallyDelivered'].includes(order.value.state)) return 3
  if (['PaymentSettled', 'PaymentAuthorized', 'Modifying', 'ArrangingAdditionalPayment'].includes(order.value.state)) return 2
  return 1
})
const steps = computed(() => isFa.value
  ? ['ثبت سفارش', 'تأیید پرداخت', 'ارسال', 'تحویل']
  : ['Placed', 'Paid', 'Shipped', 'Delivered'])

useHead({ title: computed(() => order.value ? (isFa.value ? `سفارش ${order.value.code}` : `Order ${order.value.code}`) : (isFa.value ? 'جزئیات سفارش' : 'Order details')) })
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
    <NuxtLink :to="localePath('/profile')" class="text-sm font-bold text-brown underline decoration-gold underline-offset-4">{{ isFa ? 'بازگشت به پروفایل' : 'Back to profile' }}</NuxtLink>
    <div v-if="pending" class="mt-7 grid gap-5"><BaseSkeleton class="h-40 rounded-3xl" /><BaseSkeleton class="h-72 rounded-3xl" /></div>
    <div v-else-if="error || !order" class="mt-7 rounded-3xl border border-border bg-[#f8fbf9] px-6 py-14 text-center">
      <h1 class="text-xl font-bold text-brown">{{ isFa ? 'این سفارش در حساب شما پیدا نشد' : 'Order not found in your account' }}</h1>
      <p class="mt-3 text-sm text-muted">{{ isFa ? 'ممکن است سفارش متعلق به حساب دیگری باشد یا ارتباط با فروشگاه برقرار نباشد.' : 'It may belong to another account, or the shop may be unavailable.' }}</p>
      <button v-if="error" type="button" class="mt-5 rounded-full border border-brown px-5 py-2 text-sm font-bold text-brown" @click="refresh()">{{ isFa ? 'تلاش دوباره' : 'Retry' }}</button>
    </div>
    <template v-else>
      <div class="mt-7 flex flex-wrap items-start justify-between gap-5 rounded-[2rem] bg-brown px-6 py-8 text-white sm:px-10">
        <div><p class="text-xs font-bold tracking-widest text-white/60">{{ isFa ? 'جزئیات خرید' : 'ORDER DETAILS' }}</p><h1 class="mt-2 text-2xl font-bold sm:text-3xl">{{ isFa ? 'سفارش' : 'Order' }} <span dir="ltr">#{{ order.code }}</span></h1><p class="mt-3 text-sm text-white/65">{{ formatOrderDate(order.orderPlacedAt ?? order.createdAt, locale) }}</p></div>
        <span class="rounded-full bg-white/15 px-4 py-2 text-sm font-bold">{{ orderStatus(order.state, locale).label }}</span>
      </div>

      <div v-if="order.state !== 'Cancelled'" class="mt-5 grid grid-cols-4 gap-2 rounded-3xl border border-border bg-white p-5 sm:gap-4 sm:p-7">
        <div v-for="(step, index) in steps" :key="step" class="min-w-0 text-center">
          <div class="mx-auto grid size-9 place-items-center rounded-full border text-xs font-bold sm:size-11" :class="index < progressStep ? 'border-brown bg-brown text-white' : 'border-border bg-cream text-muted'">{{ index < progressStep ? '✓' : index + 1 }}</div>
          <p class="mt-2 text-[11px] font-semibold sm:text-sm" :class="index < progressStep ? 'text-brown' : 'text-muted'">{{ step }}</p>
        </div>
      </div>

      <div class="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        <section class="overflow-hidden rounded-3xl border border-border bg-white">
          <div class="border-b border-border px-5 py-5 sm:px-7"><h2 class="text-lg font-bold text-brown">{{ isFa ? 'کالاهای سفارش' : 'Order items' }}</h2><p class="mt-1 text-xs text-muted">{{ order.totalQuantity }} {{ isFa ? 'قلم کالا' : 'items' }}</p></div>
          <div v-for="line in order.lines" :key="line.id" class="flex items-center gap-4 border-b border-border p-5 last:border-b-0 sm:p-7">
            <NuxtLink :to="localePath(productPath(line.productVariant.product))" class="size-20 shrink-0 overflow-hidden rounded-2xl bg-cream sm:size-24"><NuxtImg v-if="line.featuredAsset?.preview" :src="line.featuredAsset.preview" :alt="line.productVariant.name" class="size-full object-cover" sizes="96px" /></NuxtLink>
            <div class="min-w-0 flex-1"><NuxtLink :to="localePath(productPath(line.productVariant.product))" class="font-bold text-brown hover:underline">{{ line.productVariant.name }}</NuxtLink><p class="mt-1 text-xs text-muted">{{ isFa ? 'تعداد:' : 'Quantity:' }} {{ line.quantity }}</p></div>
            <strong class="shrink-0 text-sm text-brown">{{ formatPrice(line.discountedLinePriceWithTax, order.currencyCode, locale) }}</strong>
          </div>
        </section>

        <aside class="grid gap-5">
          <section class="rounded-3xl border border-border bg-[#f8fbf9] p-6"><h2 class="text-lg font-bold text-brown">{{ isFa ? 'خلاصه پرداخت' : 'Payment summary' }}</h2><dl class="mt-5 grid gap-4 text-sm"><div class="flex justify-between gap-4"><dt class="text-muted">{{ isFa ? 'کالاها' : 'Items' }}</dt><dd class="font-semibold text-brown">{{ formatPrice(order.subTotalWithTax, order.currencyCode, locale) }}</dd></div><div class="flex justify-between gap-4"><dt class="text-muted">{{ isFa ? 'ارسال' : 'Shipping' }}</dt><dd class="font-semibold text-brown">{{ formatPrice(order.shippingWithTax, order.currencyCode, locale) }}</dd></div><div class="flex justify-between gap-4 border-t border-border pt-4 text-base font-bold text-brown"><dt>{{ isFa ? 'جمع کل' : 'Total' }}</dt><dd>{{ formatPrice(order.totalWithTax, order.currencyCode, locale) }}</dd></div></dl><p v-if="payment?.transactionId" class="mt-5 break-all border-t border-border pt-4 text-xs text-muted">{{ isFa ? 'کد پیگیری پرداخت:' : 'Payment reference:' }} <span dir="ltr" class="font-bold text-brown">{{ payment.transactionId }}</span></p></section>
          <section class="rounded-3xl border border-border bg-white p-6"><h2 class="text-lg font-bold text-brown">{{ isFa ? 'تحویل سفارش' : 'Delivery' }}</h2><p v-if="order.shippingAddress" class="mt-4 text-sm leading-7 text-muted"><strong class="block text-brown">{{ order.shippingAddress.fullName }}</strong>{{ [order.shippingAddress.province, order.shippingAddress.city, order.shippingAddress.streetLine1, order.shippingAddress.streetLine2].filter(Boolean).join('، ') }}<span v-if="order.shippingAddress.postalCode" class="block">{{ isFa ? 'کد پستی:' : 'Postal code:' }} {{ order.shippingAddress.postalCode }}</span><span v-if="order.shippingAddress.phoneNumber" class="block" dir="ltr">{{ order.shippingAddress.phoneNumber }}</span></p><p v-if="order.shippingLines.length" class="mt-4 border-t border-border pt-4 text-xs text-muted">{{ isFa ? 'روش ارسال:' : 'Shipping method:' }} {{ order.shippingLines.map(line => line.shippingMethod.name).join('، ') }}</p><p v-if="trackingCodes.length" class="mt-4 border-t border-border pt-4 text-xs text-muted">{{ isFa ? 'کد رهگیری:' : 'Tracking:' }} <span v-for="code in trackingCodes" :key="code" class="block font-bold text-brown" dir="ltr">{{ code }}</span></p></section>
        </aside>
      </div>
    </template>
  </div>
</template>
