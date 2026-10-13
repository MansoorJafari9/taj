<script setup lang="ts">
import type { CustomerAddress, CustomerAddressInput } from '~/services/api/customer-addresses.service'
import { formatPrice } from '~/utils/formatPrice'

definePageMeta({ middleware: 'auth' })
const { $services } = useNuxtApp()
const cart = useCartStore()
const auth = useAuthStore()
const { locale } = useI18n()
const isFa = computed(() => locale.value === 'fa')
const pending = ref(false)
const shippingPending = ref(false)
const loading = ref(true)
const error = ref('')
const methods = ref<Array<{ id: string, name: string, description: string, priceWithTax: number }>>([])
const selectedMethod = ref('')
const savedAddresses = ref<CustomerAddress[]>([])
const addressMode = ref<'saved' | 'new'>('new')
const selectedAddressId = ref('')
const appliedAddressId = ref('')
const addressConfirmed = computed(() =>
  addressMode.value === 'saved' && !!selectedAddressId.value
  && selectedAddressId.value === appliedAddressId.value,
)
const shippingConfirmed = computed(() =>
  addressConfirmed.value && !shippingPending.value && !!selectedMethod.value
  && cart.order?.shippingLines?.[0]?.shippingMethod?.id === selectedMethod.value,
)
const address = reactive({
  fullName: '', phoneNumber: '', province: '', city: '', streetLine1: '', streetLine2: '', postalCode: '', countryCode: 'IR',
})

function resetNewAddress() {
  Object.assign(address, {
    fullName: [auth.customer?.firstName, auth.customer?.lastName].filter(Boolean).join(' '),
    phoneNumber: auth.customer?.phoneNumber ?? '',
    province: '', city: '', streetLine1: '', streetLine2: '', postalCode: '', countryCode: 'IR',
  })
}

function addressForOrder(saved: CustomerAddress): CustomerAddressInput {
  return {
    fullName: saved.fullName || [auth.customer?.firstName, auth.customer?.lastName].filter(Boolean).join(' '),
    phoneNumber: saved.phoneNumber || auth.customer?.phoneNumber || '',
    province: saved.province || '',
    city: saved.city || '',
    streetLine1: saved.streetLine1,
    streetLine2: saved.streetLine2 || '',
    postalCode: saved.postalCode || '',
    countryCode: saved.country.code,
  }
}

function isCompleteAddress(input: CustomerAddressInput): boolean {
  return !!(input.fullName && input.phoneNumber && input.province && input.city && input.streetLine1 && input.postalCode)
}

function matchesOrderAddress(saved: CustomerAddress): boolean {
  const current = cart.order?.shippingAddress
  if (!current?.streetLine1) return false
  const value = addressForOrder(saved)
  if (!isCompleteAddress(value)) return false
  return (['fullName', 'phoneNumber', 'province', 'city', 'streetLine1', 'streetLine2', 'postalCode', 'countryCode'] as const)
    .every(field => (value[field] || '').trim() === (current[field] || '').trim())
}

onMounted(async () => {
  resetNewAddress()
  try {
    await cart.refresh($services.orders)
    if (cart.order?.shippingAddress?.streetLine1) {
      const current = cart.order.shippingAddress
      address.fullName = current.fullName || address.fullName
      address.phoneNumber = current.phoneNumber || address.phoneNumber
      address.province = current.province || ''
      address.city = current.city || ''
      address.streetLine1 = current.streetLine1 || ''
      address.streetLine2 = current.streetLine2 || ''
      address.postalCode = current.postalCode || ''
      address.countryCode = current.countryCode || 'IR'
    }
    if (!address.phoneNumber) address.phoneNumber = auth.customer?.phoneNumber ?? ''
    try {
      savedAddresses.value = await $services.customerAddresses.list()
    } catch {
      error.value = isFa.value ? 'بارگذاری آدرس‌های ذخیره‌شده انجام نشد. می‌توانید آدرس جدید ثبت کنید.' : 'Saved addresses could not be loaded. You can add a new address.'
    }
    const matching = savedAddresses.value.find(matchesOrderAddress)
    if (matching) {
      selectedAddressId.value = matching.id
      appliedAddressId.value = matching.id
      addressMode.value = 'saved'
    } else if (savedAddresses.value.length && !cart.order?.shippingAddress?.streetLine1) {
      addressMode.value = 'saved'
    }
    if (cart.order?.shippingAddress?.streetLine1) {
      methods.value = await $services.orders.eligibleShippingMethods()
      const savedMethod = cart.order.shippingLines?.[0]?.shippingMethod?.id ?? ''
      selectedMethod.value = matching && methods.value.some(method => method.id === savedMethod) ? savedMethod : ''
    }
  } catch { error.value = isFa.value ? 'بارگذاری سفارش ناموفق بود.' : 'Could not load the order.' }
  finally { loading.value = false }
})

async function applyAddress(input: CustomerAddressInput) {
  selectedMethod.value = ''
  methods.value = []
  if (cart.order?.state === 'ArrangingPayment') cart.order = await $services.orders.transitionTo('AddingItems')
  cart.order = await $services.orders.setShippingAddress(input)
  methods.value = await $services.orders.eligibleShippingMethods()
  if (!methods.value.length) error.value = isFa.value
    ? 'برای این آدرس روش ارسال فعالی در وندور تعریف نشده است. از مدیریت فروشگاه، روش ارسال بسازید.'
    : 'No shipping method is available for this address. Configure one in Vendure.'
}

async function selectSavedAddress(id: string) {
  if (pending.value) return
  const saved = savedAddresses.value.find(item => item.id === id)
  if (!saved) return
  const input = addressForOrder(saved)
  if (!isCompleteAddress(input)) {
    selectedAddressId.value = ''
    error.value = isFa.value
      ? 'این آدرس کامل نیست. لطفاً آدرس جدیدی با مشخصات کامل ثبت کنید.'
      : 'This address is incomplete. Please add a new address with all required details.'
    return
  }
  pending.value = true
  error.value = ''
  selectedMethod.value = ''
  try {
    await applyAddress(input)
    selectedAddressId.value = id
    appliedAddressId.value = id
    addressMode.value = 'saved'
  } catch {
    selectedAddressId.value = ''
    appliedAddressId.value = ''
    error.value = isFa.value ? 'انتخاب آدرس انجام نشد. دوباره تلاش کنید.' : 'Could not use this address. Please try again.'
  } finally { pending.value = false }
}

function startNewAddress() {
  if (pending.value) return
  resetNewAddress()
  addressMode.value = 'new'
  selectedAddressId.value = ''
  selectedMethod.value = ''
  error.value = ''
}

function cancelNewAddress() {
  addressMode.value = 'saved'
  selectedAddressId.value = appliedAddressId.value
  const savedMethod = cart.order?.shippingLines?.[0]?.shippingMethod?.id ?? ''
  selectedMethod.value = methods.value.some(method => method.id === savedMethod) ? savedMethod : ''
  error.value = ''
}

async function saveNewAddress() {
  if (pending.value) return
  pending.value = true
  error.value = ''
  let created: CustomerAddress | null = null
  try {
    created = await $services.customerAddresses.create({ ...address })
    savedAddresses.value = [created, ...savedAddresses.value]
    addressMode.value = 'saved'
    await applyAddress(addressForOrder(created))
    selectedAddressId.value = created.id
    appliedAddressId.value = created.id
  } catch {
    selectedAddressId.value = ''
    appliedAddressId.value = ''
    error.value = created
      ? (isFa.value ? 'آدرس ذخیره شد، اما روی سفارش اعمال نشد. دوباره آن را از لیست انتخاب کنید.' : 'Address saved, but could not be applied to the order. Select it again from the list.')
      : (isFa.value ? 'ذخیره آدرس انجام نشد. اطلاعات را بررسی کنید.' : 'Could not save the address. Check its details.')
  } finally { pending.value = false }
}

async function selectShippingMethod(methodId: string) {
  if (pending.value || !cart.order || !addressConfirmed.value) return
  pending.value = true
  shippingPending.value = true
  error.value = ''
  try {
    if (cart.order.state === 'ArrangingPayment') {
      cart.order = await $services.orders.transitionTo('AddingItems')
    }
    cart.order = await $services.orders.setShippingMethod(methodId)
    if (cart.order.shippingLines?.[0]?.shippingMethod?.id !== methodId) {
      throw new Error('Shipping method was not applied')
    }
    selectedMethod.value = methodId
  } catch {
    try { await cart.refresh($services.orders) } catch { /* Keep the last known order. */ }
    // The server may still hold an older method; require an explicit selection
    // again so the customer cannot accidentally pay with a different quote.
    selectedMethod.value = ''
    error.value = isFa.value
      ? 'محاسبه هزینه ارسال انجام نشد. لطفاً روش ارسال را دوباره انتخاب کنید.'
      : 'Could not calculate shipping. Please select a shipping method again.'
  } finally {
    shippingPending.value = false
    pending.value = false
  }
}

async function pay() {
  if (!shippingConfirmed.value || pending.value) return
  pending.value = true
  error.value = ''
  try {
    if (cart.order?.state !== 'ArrangingPayment') {
      cart.order = await $services.orders.transitionTo('ArrangingPayment')
    }
    const payment = await $services.orders.startZarinpal(locale.value === 'en' ? 'en' : 'fa')
    if (!/^https:\/\/(payment|sandbox)\.zarinpal\.com\/pg\/StartPay\//.test(payment.url)) throw new Error('Invalid payment URL')
    window.location.assign(payment.url)
  } catch {
    error.value = isFa.value ? 'شروع پرداخت ممکن نشد. روش ارسال، موجودی کالا و تنظیمات درگاه را بررسی کنید.' : 'Could not start payment. Check shipping, stock and gateway settings.'
    pending.value = false
  }
}

useHead({ title: computed(() => isFa.value ? 'تسویه حساب' : 'Checkout') })
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
    <p class="text-xs font-bold tracking-widest text-gold">{{ isFa ? 'آخرین قدم' : 'FINAL STEP' }}</p>
    <h1 class="mt-2 text-3xl font-bold text-brown sm:text-4xl">{{ isFa ? 'تسویه حساب' : 'Checkout' }}</h1>
    <p v-if="loading" class="mt-10 text-muted">{{ isFa ? 'در حال بارگذاری…' : 'Loading…' }}</p>
    <div v-else-if="!cart.order?.lines.length" class="mt-8 rounded-3xl border border-border bg-cream p-8 text-muted">{{ isFa ? 'سبد خرید شما خالی است.' : 'Your cart is empty.' }}</div>
    <div v-else class="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
      <div class="grid gap-6">
        <section class="rounded-3xl border border-border bg-white p-6 sm:p-8">
          <h2 class="text-xl font-bold text-brown">{{ isFa ? 'آدرس تحویل' : 'Delivery address' }}</h2>
          <p class="mt-1 text-sm text-muted">{{ isFa ? 'از آدرس‌های ذخیره‌شده انتخاب کنید یا آدرس تازه‌ای ثبت کنید.' : 'Choose a saved address or add a new one.' }}</p>
          <div v-if="savedAddresses.length" class="mt-6 grid gap-3">
            <label v-for="saved in savedAddresses" :key="saved.id" class="flex cursor-pointer gap-3 rounded-2xl border p-4 transition" :class="selectedAddressId === saved.id && addressMode === 'saved' ? 'border-brown bg-cream' : 'border-border hover:border-brown/40'">
              <input v-model="selectedAddressId" type="radio" name="delivery-address" :value="saved.id" :disabled="pending" class="mt-1 accent-brown" @change="selectSavedAddress(saved.id)">
              <span class="min-w-0 text-sm leading-7">
                <span class="flex flex-wrap items-center gap-2"><strong class="text-brown">{{ saved.fullName || (isFa ? 'گیرنده' : 'Recipient') }}</strong><span v-if="saved.defaultShippingAddress" class="rounded-full bg-white px-2 py-0.5 text-xs text-brown">{{ isFa ? 'پیش‌فرض' : 'Default' }}</span></span>
                <span class="block text-muted">{{ saved.streetLine1 }}<template v-if="saved.streetLine2">، {{ saved.streetLine2 }}</template></span>
                <span class="block text-muted">{{ [saved.city, saved.province, saved.postalCode].filter(Boolean).join('، ') }}</span>
                <span v-if="saved.phoneNumber" class="block text-muted" dir="ltr">{{ saved.phoneNumber }}</span>
              </span>
            </label>
            <button v-if="addressMode !== 'new'" type="button" :disabled="pending" class="mt-1 rounded-2xl border border-dashed border-brown/40 px-5 py-4 text-sm font-bold text-brown transition hover:bg-cream disabled:opacity-50" @click="startNewAddress">+ {{ isFa ? 'آدرس جدید' : 'Add a new address' }}</button>
          </div>
          <p v-else class="mt-6 rounded-2xl bg-cream px-5 py-4 text-sm text-muted">{{ isFa ? 'هنوز آدرسی ذخیره نکرده‌اید؛ مشخصات آدرس جدید را وارد کنید.' : 'No saved addresses yet. Enter a new address below.' }}</p>
          <form v-if="addressMode === 'new'" id="address-form" class="mt-6 grid gap-4 sm:grid-cols-2" @submit.prevent="saveNewAddress">
            <h3 class="text-base font-bold text-brown sm:col-span-2">{{ isFa ? 'آدرس جدید' : 'New address' }}</h3>
            <label class="grid gap-2 text-sm font-semibold text-brown">{{ isFa ? 'نام گیرنده' : 'Recipient name' }}<input v-model.trim="address.fullName" required class="rounded-xl border border-border px-4 py-3 outline-none focus:border-brown"></label>
            <label class="grid gap-2 text-sm font-semibold text-brown">{{ isFa ? 'شماره تماس' : 'Phone' }}<input v-model.trim="address.phoneNumber" required type="tel" dir="ltr" class="rounded-xl border border-border px-4 py-3 outline-none focus:border-brown"></label>
            <label class="grid gap-2 text-sm font-semibold text-brown">{{ isFa ? 'استان' : 'Province' }}<input v-model.trim="address.province" required class="rounded-xl border border-border px-4 py-3 outline-none focus:border-brown"></label>
            <label class="grid gap-2 text-sm font-semibold text-brown">{{ isFa ? 'شهر' : 'City' }}<input v-model.trim="address.city" required class="rounded-xl border border-border px-4 py-3 outline-none focus:border-brown"></label>
            <label class="grid gap-2 text-sm font-semibold text-brown sm:col-span-2">{{ isFa ? 'نشانی کامل' : 'Street address' }}<textarea v-model.trim="address.streetLine1" required rows="2" class="rounded-xl border border-border px-4 py-3 outline-none focus:border-brown"></textarea></label>
            <label class="grid gap-2 text-sm font-semibold text-brown">{{ isFa ? 'واحد یا پلاک تکمیلی (اختیاری)' : 'Apartment or additional details (optional)' }}<input v-model.trim="address.streetLine2" class="rounded-xl border border-border px-4 py-3 outline-none focus:border-brown"></label>
            <label class="grid gap-2 text-sm font-semibold text-brown">{{ isFa ? 'کد پستی' : 'Postal code' }}<input v-model.trim="address.postalCode" required inputmode="numeric" dir="ltr" class="rounded-xl border border-border px-4 py-3 outline-none focus:border-brown"></label>
            <div class="flex flex-wrap gap-3 sm:col-span-2"><button :disabled="pending" class="rounded-full border border-brown bg-brown px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2d745b] disabled:opacity-50">{{ pending ? (isFa ? 'لطفاً صبر کنید…' : 'Please wait…') : (isFa ? 'ذخیره آدرس و نمایش ارسال' : 'Save address and show shipping') }}</button><button v-if="savedAddresses.length" type="button" :disabled="pending" class="rounded-full border border-border px-6 py-3 text-sm font-bold text-brown" @click="cancelNewAddress">{{ isFa ? 'انصراف' : 'Cancel' }}</button></div>
          </form>
          <p v-if="error && !addressConfirmed" role="alert" class="mt-5 rounded-xl bg-red-50 p-3 text-sm text-danger">{{ error }}</p>
        </section>
        <section class="rounded-3xl border border-border bg-white p-6 sm:p-8">
          <h2 class="text-xl font-bold text-brown">{{ isFa ? 'روش ارسال' : 'Shipping method' }}</h2>
          <p v-if="!addressConfirmed" class="mt-4 text-sm leading-7 text-muted">{{ isFa ? 'ابتدا یک آدرس ذخیره‌شده را انتخاب کنید یا آدرس جدید را ثبت کنید.' : 'Select a saved address or save a new one first.' }}</p>
          <p v-else-if="!methods.length" class="mt-4 text-sm leading-7 text-muted">{{ isFa ? 'برای این آدرس روش ارسال فعالی وجود ندارد. روش ارسال را در داشبورد وندور بررسی کنید.' : 'No shipping method is available for this address. Check the Vendure dashboard.' }}</p>
          <div v-else class="mt-5 grid gap-3">
            <label v-for="method in methods" :key="method.id" class="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition" :class="selectedMethod === method.id ? 'border-brown bg-cream' : 'border-border'">
              <span class="flex items-center gap-3"><input v-model="selectedMethod" type="radio" name="shipping" :value="method.id" :disabled="pending" class="accent-brown" @change="selectShippingMethod(method.id)"><span><strong class="block text-sm text-brown">{{ method.name }}</strong><small class="text-muted">{{ method.description }}</small></span></span>
              <strong class="shrink-0 text-sm text-brown">{{ formatPrice(method.priceWithTax, cart.order.currencyCode, locale) }}</strong>
            </label>
          </div>
        </section>
      </div>
      <aside class="rounded-3xl border border-border bg-[#f8fbf9] p-6 lg:sticky lg:top-40">
        <h2 class="text-lg font-bold text-brown">{{ isFa ? 'خلاصه سفارش' : 'Order summary' }}</h2>
        <div v-for="line in cart.order.lines" :key="line.id" class="flex justify-between gap-4 border-b border-border py-4 text-sm"><span class="text-muted">{{ line.productVariant.name }} × {{ line.quantity }}</span><strong class="shrink-0 text-brown">{{ formatPrice(line.discountedLinePriceWithTax, cart.order.currencyCode, locale) }}</strong></div>
        <div class="mt-5 flex justify-between gap-4 text-sm"><span class="text-muted">{{ isFa ? 'ارسال' : 'Shipping' }}</span><strong class="text-brown">{{ shippingConfirmed ? formatPrice(cart.order.shippingWithTax, cart.order.currencyCode, locale) : shippingPending ? (isFa ? 'در حال محاسبه…' : 'Calculating…') : (isFa ? 'روش ارسال را انتخاب کنید' : 'Select a shipping method') }}</strong></div>
        <div class="mt-5 flex justify-between gap-4 border-t border-border pt-5 text-lg font-bold text-brown"><span>{{ isFa ? 'قابل پرداخت' : 'Total' }}</span><span>{{ shippingConfirmed ? formatPrice(cart.order.totalWithTax, cart.order.currencyCode, locale) : '—' }}</span></div>
        <p v-if="error && addressConfirmed" role="alert" class="mt-5 rounded-xl bg-red-50 p-3 text-sm text-danger">{{ error }}</p>
        <button type="button" :disabled="pending || !shippingConfirmed" class="mt-6 w-full rounded-full bg-brown px-6 py-3.5 font-bold text-white transition hover:bg-[#2d745b] disabled:cursor-not-allowed disabled:opacity-40" @click="pay">{{ pending ? (isFa ? 'لطفاً صبر کنید…' : 'Please wait…') : (isFa ? 'پرداخت امن با زرین‌پال' : 'Pay securely with Zarinpal') }}</button>
        <p class="mt-3 text-center text-xs leading-6 text-muted">{{ isFa ? 'پرداخت فقط پس از تأیید سروری زرین‌پال ثبت می‌شود.' : 'Payment is recorded only after server verification.' }}</p>
      </aside>
    </div>
  </div>
</template>
