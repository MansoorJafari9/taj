<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { $services } = useNuxtApp()
const cart = useCartStore()
const route = useRoute()
const localePath = useLocalePath()
const { locale } = useI18n()
const isFa = computed(() => locale.value === 'fa')
const pending = ref(true)
const result = ref<{ success: boolean, orderCode: string, referenceId: string | null } | null>(null)
const error = ref('')

onMounted(async () => {
  const authority = typeof route.query.Authority === 'string' ? route.query.Authority : ''
  const status = typeof route.query.Status === 'string' ? route.query.Status : 'NOK'
  if (!authority) { error.value = isFa.value ? 'شناسهٔ پرداخت در آدرس بازگشت وجود ندارد.' : 'Payment authority is missing.'; pending.value = false; return }
  try {
    result.value = await $services.orders.confirmZarinpal(authority, status)
    if (result.value.success) await cart.refresh($services.orders)
  } catch {
    error.value = isFa.value ? 'تأیید پرداخت انجام نشد. اگر مبلغ کسر شده است، با پشتیبانی تماس بگیرید و کد تراکنش را نگه دارید.' : 'Could not verify payment. If charged, contact support with your transaction code.'
  } finally { pending.value = false }
})

useHead({ title: computed(() => isFa.value ? 'نتیجه پرداخت' : 'Payment result') })
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-20 text-center">
    <div class="rounded-[2rem] border border-border bg-white p-8 shadow-sm sm:p-12">
      <div class="mx-auto grid size-16 place-items-center rounded-full text-3xl" :class="result?.success ? 'bg-green-50 text-brown' : 'bg-cream text-gold'">{{ pending ? '…' : result?.success ? '✓' : '!' }}</div>
      <h1 class="mt-5 text-2xl font-bold text-brown">{{ pending ? (isFa ? 'در حال بررسی پرداخت' : 'Verifying payment') : result?.success ? (isFa ? 'پرداخت با موفقیت ثبت شد' : 'Payment confirmed') : (isFa ? 'پرداخت ثبت نشد' : 'Payment not completed') }}</h1>
      <p v-if="result?.success" class="mt-3 text-sm text-muted">{{ isFa ? 'شماره سفارش:' : 'Order:' }} {{ result.orderCode }}<span v-if="result.referenceId" class="mt-2 block" dir="ltr">{{ isFa ? 'کد پیگیری:' : 'Reference:' }} {{ result.referenceId }}</span></p>
      <p v-else-if="error" role="alert" class="mt-3 text-sm leading-7 text-muted">{{ error }}</p>
      <p v-else-if="!pending" class="mt-3 text-sm text-muted">{{ isFa ? 'پرداخت لغو شد یا توسط درگاه تأیید نشد.' : 'The payment was cancelled or not verified.' }}</p>
      <NuxtLink :to="localePath(result?.success ? '/' : '/checkout')" class="mt-8 inline-flex rounded-full bg-brown px-7 py-3 text-sm font-bold text-white">{{ result?.success ? (isFa ? 'بازگشت به فروشگاه' : 'Back to shop') : (isFa ? 'بازگشت به تسویه حساب' : 'Back to checkout') }}</NuxtLink>
      <NuxtLink v-if="result?.success" :to="localePath('/profile')" class="ms-3 mt-4 inline-flex rounded-full border border-brown px-7 py-3 text-sm font-bold text-brown">{{ isFa ? 'پیگیری سفارش‌ها' : 'View my orders' }}</NuxtLink>
    </div>
  </div>
</template>
