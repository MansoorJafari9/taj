<script setup lang="ts">
import { formatPrice } from '~/utils/formatPrice'
import { formatOrderDate, orderStatus } from '~/utils/orderStatus'
import { normalizeIranMobile } from '~/utils/phone'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ robots: 'noindex,nofollow' })

const { $services } = useNuxtApp()
const auth = useAuthStore()
const cart = useCartStore()
const route = useRoute()
const localePath = useLocalePath()
const { locale } = useI18n()
const isFa = computed(() => locale.value === 'fa')
const pageSize = 6
const page = computed(() => {
  const value = Number(route.query.page)
  return Number.isSafeInteger(value) && value > 0 ? value : 1
})
const editing = ref(false)
const saving = ref(false)
const signingOut = ref(false)
const profileError = ref('')
const profileSuccess = ref('')
const profile = reactive({ firstName: '', lastName: '', phoneNumber: '' })

watch(() => auth.customer, (customer) => {
  if (!customer) return
  profile.firstName = customer.firstName
  profile.lastName = customer.lastName
  profile.phoneNumber = customer.phoneNumber ?? ''
}, { immediate: true })

function cancelEdit() {
  profile.firstName = auth.customer?.firstName ?? ''
  profile.lastName = auth.customer?.lastName ?? ''
  profile.phoneNumber = auth.customer?.phoneNumber ?? ''
  editing.value = false
  profileError.value = ''
}

const { data: orders, pending, error, refresh } = await useAsyncData(
  `profile-orders-${auth.customer?.id ?? 'guest'}`,
  () => $services.customerOrders.list((page.value - 1) * pageSize, pageSize, locale.value),
  { watch: [page, locale] },
)
const { data: activeOrder } = await useAsyncData(
  `profile-active-order-${auth.customer?.id ?? 'guest'}`,
  () => $services.orders.getActive(),
)

const pageCount = computed(() => Math.ceil((orders.value?.totalItems ?? 0) / pageSize))

function pageLink(number: number) {
  return localePath({ path: '/profile', query: number > 1 ? { page: String(number) } : {} })
}

async function saveProfile() {
  if (saving.value) return
  profileError.value = ''
  profileSuccess.value = ''
  const phoneNumber = normalizeIranMobile(profile.phoneNumber)
  if (!profile.firstName.trim() || !profile.lastName.trim() || !phoneNumber) {
    profileError.value = isFa.value ? 'نام، نام خانوادگی و شماره موبایل معتبر را وارد کنید.' : 'Enter your name and a valid Iranian mobile number.'
    return
  }
  saving.value = true
  try {
    const customer = await $services.auth.updateProfile({
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      phoneNumber,
    })
    auth.setCustomer(customer)
    editing.value = false
    profileSuccess.value = isFa.value ? 'اطلاعات پروفایل ذخیره شد.' : 'Your profile was updated.'
  } catch {
    profileError.value = isFa.value ? 'ذخیرهٔ اطلاعات انجام نشد. دوباره تلاش کنید.' : 'Could not update your profile. Try again.'
  } finally { saving.value = false }
}

async function signOut() {
  if (signingOut.value) return
  signingOut.value = true
  try {
    await $services.auth.logout()
    auth.setCustomer(null)
    await cart.refresh($services.orders).catch(() => {})
    await navigateTo(localePath('/account'))
  } catch {
    profileError.value = isFa.value ? 'خروج از حساب انجام نشد.' : 'Could not sign out.'
  } finally { signingOut.value = false }
}

useHead({ title: computed(() => isFa.value ? 'پروفایل من' : 'My profile') })
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <div class="overflow-hidden rounded-[2rem] bg-brown px-6 py-8 text-white sm:px-10 sm:py-10">
      <div class="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p class="text-xs font-bold tracking-[0.16em] text-white/60">{{ isFa ? 'حساب کاربری من' : 'MY ACCOUNT' }}</p>
          <h1 class="mt-2 text-3xl font-bold sm:text-4xl">{{ isFa ? 'سلام' : 'Hello' }} {{ auth.customer?.firstName }} <span aria-hidden="true">✦</span></h1>
          <p class="mt-3 text-sm text-white/70">{{ isFa ? 'سفارش‌ها و مشخصاتت، همه در یک‌جا.' : 'Your orders and details, all in one place.' }}</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <NuxtLink :to="localePath('/products')" class="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brown transition hover:bg-cream">{{ isFa ? 'ادامهٔ خرید' : 'Keep shopping' }}</NuxtLink>
          <button type="button" :disabled="signingOut" class="rounded-full border border-white/40 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-50" @click="signOut">{{ isFa ? 'خروج' : 'Sign out' }}</button>
        </div>
      </div>
    </div>

    <div class="mt-8 grid gap-8 lg:grid-cols-[19rem_minmax(0,1fr)] lg:items-start">
      <aside class="rounded-[1.5rem] border border-border bg-[#f8fbf9] p-6 lg:sticky lg:top-40">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-lg font-bold text-brown">{{ isFa ? 'مشخصات من' : 'My details' }}</h2>
          <button v-if="!editing" type="button" class="text-xs font-bold text-brown underline underline-offset-4" @click="editing = true; profileError = ''; profileSuccess = ''">{{ isFa ? 'ویرایش' : 'Edit' }}</button>
        </div>
        <template v-if="!editing">
          <dl class="mt-5 grid gap-5 text-sm">
            <div><dt class="text-xs text-muted">{{ isFa ? 'نام و نام خانوادگی' : 'Full name' }}</dt><dd class="mt-1 font-bold text-brown">{{ auth.customer?.firstName }} {{ auth.customer?.lastName }}</dd></div>
            <div><dt class="text-xs text-muted">{{ isFa ? 'شماره موبایل' : 'Mobile number' }}</dt><dd class="mt-1 font-semibold text-brown" dir="ltr">{{ auth.customer?.phoneNumber || '—' }}</dd></div>
            <div><dt class="text-xs text-muted">{{ isFa ? 'ایمیل' : 'Email' }}</dt><dd class="mt-1 break-all font-semibold text-brown" dir="ltr">{{ auth.customer?.emailAddress }}</dd></div>
          </dl>
        </template>
        <form v-else class="mt-5 grid gap-4" @submit.prevent="saveProfile">
          <label class="grid gap-1.5 text-xs font-bold text-brown">{{ isFa ? 'نام' : 'First name' }}<input v-model.trim="profile.firstName" required autocomplete="given-name" class="rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brown"></label>
          <label class="grid gap-1.5 text-xs font-bold text-brown">{{ isFa ? 'نام خانوادگی' : 'Last name' }}<input v-model.trim="profile.lastName" required autocomplete="family-name" class="rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brown"></label>
          <label class="grid gap-1.5 text-xs font-bold text-brown">{{ isFa ? 'شماره موبایل' : 'Mobile number' }}<input v-model.trim="profile.phoneNumber" required type="tel" autocomplete="tel" dir="ltr" class="rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brown"></label>
          <p class="text-xs leading-5 text-muted">{{ isFa ? 'برای تغییر ایمیل، با پشتیبانی تماس بگیرید.' : 'Contact support to change your email.' }}</p>
          <div class="flex gap-2">
            <button :disabled="saving" class="rounded-full bg-brown px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{{ saving ? (isFa ? 'در حال ذخیره…' : 'Saving…') : (isFa ? 'ذخیره' : 'Save') }}</button>
            <button type="button" class="rounded-full border border-border px-4 py-2 text-xs font-bold text-brown" @click="cancelEdit">{{ isFa ? 'انصراف' : 'Cancel' }}</button>
          </div>
        </form>
        <p v-if="profileError" role="alert" class="mt-4 rounded-xl bg-red-50 p-3 text-xs text-danger">{{ profileError }}</p>
        <p v-if="profileSuccess" role="status" class="mt-4 rounded-xl bg-green-50 p-3 text-xs text-brown">{{ profileSuccess }}</p>
      </aside>

      <section class="min-w-0">
        <div v-if="activeOrder?.state === 'ArrangingPayment'" class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-5 sm:px-6">
          <div><p class="text-xs font-bold text-amber-800">{{ isFa ? 'سفارش در انتظار پرداخت' : 'Awaiting payment' }}</p><p class="mt-1 text-sm font-semibold text-brown">{{ isFa ? 'سفارش' : 'Order' }} #{{ activeOrder.code }} · {{ formatPrice(activeOrder.totalWithTax, activeOrder.currencyCode, locale) }}</p></div>
          <NuxtLink :to="localePath('/checkout')" class="rounded-full bg-brown px-5 py-2.5 text-xs font-bold text-white">{{ isFa ? 'ادامهٔ پرداخت' : 'Continue payment' }}</NuxtLink>
        </div>
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div><p class="text-xs font-bold tracking-[0.14em] text-gold">{{ isFa ? 'رد خریدها' : 'ORDER HISTORY' }}</p><h2 class="mt-2 text-2xl font-bold text-brown sm:text-3xl">{{ isFa ? 'سفارش‌های من' : 'My orders' }}</h2></div>
          <span v-if="orders" class="rounded-full bg-cream px-4 py-2 text-xs font-bold text-brown">{{ orders.totalItems }} {{ isFa ? 'سفارش' : 'orders' }}</span>
        </div>
        <div v-if="pending" class="mt-6 grid gap-4"><BaseSkeleton v-for="item in 3" :key="item" class="h-44 rounded-3xl" /></div>
        <div v-else-if="error" class="mt-6 rounded-3xl border border-danger/20 bg-red-50 p-6 text-sm text-danger">
          {{ isFa ? 'دریافت سفارش‌ها ناموفق بود.' : 'Could not load your orders.' }}
          <button type="button" class="ms-2 font-bold underline" @click="refresh()">{{ isFa ? 'تلاش دوباره' : 'Retry' }}</button>
        </div>
        <div v-else-if="!orders?.items.length" class="mt-6 rounded-3xl border border-border bg-[#f8fbf9] px-6 py-14 text-center">
          <div class="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-2xl text-brown" aria-hidden="true">✦</div>
          <h3 class="mt-5 text-xl font-bold text-brown">{{ orders?.totalItems ? (isFa ? 'در این صفحه سفارشی نیست' : 'No orders on this page') : (isFa ? 'هنوز سفارشی ثبت نکرده‌ای' : 'No orders yet') }}</h3>
          <p class="mt-2 text-sm text-muted">{{ orders?.totalItems ? (isFa ? 'به صفحهٔ اول سفارش‌ها برگرد.' : 'Return to the first page of orders.') : (isFa ? 'با اولین خرید، سفارش‌هایت اینجا نمایش داده می‌شوند.' : 'Your orders will appear here after your first purchase.') }}</p>
          <NuxtLink :to="orders?.totalItems ? pageLink(1) : localePath('/products')" class="mt-6 inline-flex rounded-full bg-brown px-6 py-3 text-sm font-bold text-white">{{ orders?.totalItems ? (isFa ? 'صفحهٔ اول' : 'First page') : (isFa ? 'دیدن محصولات' : 'Browse products') }}</NuxtLink>
        </div>
        <div v-else class="mt-6 grid gap-4">
          <article v-for="order in orders.items" :key="order.id" class="overflow-hidden rounded-3xl border border-border bg-white transition hover:border-brown/25 hover:shadow-sm">
            <div class="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
              <div><p class="text-xs text-muted">{{ isFa ? 'سفارش' : 'Order' }} <span dir="ltr" class="font-bold text-brown">#{{ order.code }}</span></p><p class="mt-1 text-xs text-muted">{{ formatOrderDate(order.orderPlacedAt ?? order.createdAt, locale) }}</p></div>
              <span class="rounded-full px-3 py-1.5 text-xs font-bold" :class="orderStatus(order.state, locale).tone === 'success' ? 'bg-green-50 text-brown' : orderStatus(order.state, locale).tone === 'danger' ? 'bg-red-50 text-danger' : orderStatus(order.state, locale).tone === 'warning' ? 'bg-amber-50 text-amber-800' : 'bg-cream text-brown'">{{ orderStatus(order.state, locale).label }}</span>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-5 px-5 py-5 sm:px-6">
              <div class="flex min-w-0 items-center gap-4">
                <div class="flex shrink-0 -space-x-3 space-x-reverse" dir="rtl"><div v-for="line in order.lines.slice(0, 3)" :key="line.id" class="size-12 overflow-hidden rounded-xl border-2 border-white bg-cream"><NuxtImg v-if="line.featuredAsset?.preview" :src="line.featuredAsset.preview" :alt="line.productVariant.name" class="size-full object-cover" sizes="48px" /></div></div>
                <p class="min-w-0 text-xs leading-6 text-muted">{{ order.totalQuantity }} {{ isFa ? 'قلم کالا' : 'items' }}<span v-if="order.lines.length" class="block truncate text-sm font-semibold text-brown">{{ order.lines.map(line => line.productVariant.name).join('، ') }}</span></p>
              </div>
              <div class="flex items-center gap-4"><strong class="text-sm text-brown">{{ formatPrice(order.totalWithTax, order.currencyCode, locale) }}</strong><NuxtLink :to="localePath(`/profile/orders/${order.id}`)" class="rounded-full border border-brown px-4 py-2 text-xs font-bold text-brown transition hover:bg-cream">{{ isFa ? 'جزئیات' : 'Details' }}</NuxtLink></div>
            </div>
          </article>
        </div>
        <nav v-if="pageCount > 1" class="mt-7 flex items-center justify-center gap-3 text-sm" :aria-label="isFa ? 'صفحه‌های سفارش‌ها' : 'Order pages'">
          <NuxtLink v-if="page > 1" :to="pageLink(page - 1)" class="rounded-full border border-border px-4 py-2 font-bold text-brown">{{ isFa ? 'قبلی' : 'Previous' }}</NuxtLink>
          <span class="text-muted">{{ page }} / {{ pageCount }}</span>
          <NuxtLink v-if="page < pageCount" :to="pageLink(page + 1)" class="rounded-full border border-border px-4 py-2 font-bold text-brown">{{ isFa ? 'بعدی' : 'Next' }}</NuxtLink>
        </nav>
      </section>
    </div>
  </div>
</template>
