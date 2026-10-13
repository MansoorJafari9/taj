<script setup lang="ts">
import { ApiError } from '~/services/api/client'
import { normalizeIranMobile } from '~/utils/phone'

const { $services } = useNuxtApp()
const auth = useAuthStore()
const cart = useCartStore()
const localePath = useLocalePath()
const route = useRoute()
const { locale, t } = useI18n()
const isFa = computed(() => locale.value === 'fa')
const isRegister = ref(false)
const pending = ref(false)
const error = ref('')
const form = reactive({ firstName: '', lastName: '', emailAddress: '', phoneNumber: '', password: '' })

function destination() {
  const returnTo = route.query.returnTo
  return typeof returnTo === 'string' && returnTo.startsWith('/') && !returnTo.startsWith('//')
    ? returnTo : localePath('/profile')
}

async function submit() {
  if (pending.value) return
  error.value = ''
  pending.value = true
  try {
    if (isRegister.value) {
      const phoneNumber = normalizeIranMobile(form.phoneNumber)
      if (!phoneNumber) {
        error.value = isFa.value ? 'شماره موبایل معتبر وارد کنید؛ مانند ۰۹۱۲۳۴۵۶۷۸۹.' : 'Enter a valid Iranian mobile number, e.g. 09123456789.'
        return
      }
      await $services.auth.register({ ...form, phoneNumber })
    }
    auth.setCustomer(await $services.auth.login(form.emailAddress.trim(), form.password))
    await cart.refresh($services.orders)
    await navigateTo(destination())
  } catch (cause) {
    if (cause instanceof ApiError) {
      if (cause.code === 'INVALID_CREDENTIALS_ERROR') error.value = t('errors.invalidCredentials')
      else if (cause.code === 'NOT_VERIFIED_ERROR') error.value = t('errors.accountNotVerified')
      else if (!isFa.value && cause.userMessage) error.value = cause.userMessage
      else error.value = t('errors.authFailed')
    } else {
      error.value = t('errors.authFailed')
    }
  } finally {
    pending.value = false
  }
}

async function signOut() {
  try {
    await $services.auth.logout()
    auth.setCustomer(null)
    await cart.refresh($services.orders)
  } catch { error.value = isFa.value ? 'خروج انجام نشد.' : 'Could not sign out.' }
}

useHead({ title: computed(() => isFa.value ? 'حساب کاربری' : 'Your account') })
useSeoMeta({ robots: 'noindex,nofollow' })
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-16 sm:px-6">
    <div class="rounded-[2rem] border border-border bg-white p-6 shadow-sm sm:p-10">
      <p class="text-xs font-bold tracking-widest text-gold">{{ isFa ? 'حساب کاربری' : 'YOUR ACCOUNT' }}</p>
      <template v-if="auth.isAuthenticated">
        <h1 class="mt-3 text-3xl font-bold text-brown">{{ isFa ? 'خوش آمدید' : 'Welcome' }} {{ auth.customer?.firstName }}</h1>
        <p class="mt-4 text-sm text-muted">{{ auth.customer?.emailAddress }}</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <NuxtLink :to="localePath('/profile')" class="rounded-full bg-brown px-6 py-3 text-sm font-bold text-white">{{ isFa ? 'مشاهده پروفایل و سفارش‌ها' : 'Profile and orders' }}</NuxtLink>
          <NuxtLink :to="localePath('/checkout')" class="rounded-full bg-brown px-6 py-3 text-sm font-bold text-white">{{ isFa ? 'ادامهٔ خرید' : 'Continue checkout' }}</NuxtLink>
          <button type="button" class="rounded-full border border-border px-6 py-3 text-sm font-bold text-brown" @click="signOut">{{ isFa ? 'خروج از حساب' : 'Sign out' }}</button>
        </div>
      </template>
      <template v-else>
        <h1 class="mt-3 text-3xl font-bold text-brown">{{ isRegister ? (isFa ? 'ساخت حساب' : 'Create account') : (isFa ? 'ورود به حساب' : 'Sign in') }}</h1>
        <p class="mt-2 text-sm text-muted">{{ isFa ? 'برای ثبت سفارش و پرداخت، ورود به حساب ضروری است.' : 'An account is required to place and pay for orders.' }}</p>
        <form class="mt-8 grid gap-4" @submit.prevent="submit">
          <div v-if="isRegister" class="grid gap-4 sm:grid-cols-2">
            <label class="grid gap-2 text-sm font-semibold text-brown">{{ isFa ? 'نام' : 'First name' }}<input v-model.trim="form.firstName" required autocomplete="given-name" class="rounded-xl border border-border px-4 py-3 outline-none focus:border-brown"></label>
            <label class="grid gap-2 text-sm font-semibold text-brown">{{ isFa ? 'نام خانوادگی' : 'Last name' }}<input v-model.trim="form.lastName" required autocomplete="family-name" class="rounded-xl border border-border px-4 py-3 outline-none focus:border-brown"></label>
          </div>
          <label class="grid gap-2 text-sm font-semibold text-brown">{{ isFa ? 'ایمیل' : 'Email' }}<input v-model.trim="form.emailAddress" required type="email" autocomplete="email" dir="ltr" class="rounded-xl border border-border px-4 py-3 outline-none focus:border-brown"></label>
          <label v-if="isRegister" class="grid gap-2 text-sm font-semibold text-brown">{{ isFa ? 'شماره موبایل' : 'Mobile number' }}<input v-model.trim="form.phoneNumber" required type="tel" inputmode="tel" autocomplete="tel" :placeholder="isFa ? '۰۹۱۲۳۴۵۶۷۸۹' : '09123456789'" dir="ltr" class="rounded-xl border border-border px-4 py-3 outline-none focus:border-brown"></label>
          <label class="grid gap-2 text-sm font-semibold text-brown">{{ isFa ? 'رمز عبور' : 'Password' }}<input v-model="form.password" required type="password" minlength="8" :autocomplete="isRegister ? 'new-password' : 'current-password'" class="rounded-xl border border-border px-4 py-3 outline-none focus:border-brown"></label>
          <p v-if="error" role="alert" class="rounded-xl bg-red-50 p-3 text-sm text-danger">{{ error }}</p>
          <button :disabled="pending" class="rounded-full bg-brown px-6 py-3.5 font-bold text-white transition hover:bg-[#2d745b] disabled:opacity-50">{{ pending ? (isFa ? 'لطفاً صبر کنید…' : 'Please wait…') : isRegister ? (isFa ? 'ثبت‌نام و ادامه' : 'Register and continue') : (isFa ? 'ورود و ادامه' : 'Sign in and continue') }}</button>
        </form>
        <button type="button" class="mt-5 text-sm font-semibold text-brown underline underline-offset-4" @click="isRegister = !isRegister; error = ''">{{ isRegister ? (isFa ? 'حساب دارم؛ ورود' : 'Already registered? Sign in') : (isFa ? 'حساب ندارم؛ ثبت‌نام' : 'New here? Create account') }}</button>
      </template>
    </div>
  </div>
</template>
