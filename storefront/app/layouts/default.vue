<script setup lang="ts">
import { storeToRefs } from 'pinia'
import SiteFooter from '~/components/storefront/SiteFooter.vue'

const localePath = useLocalePath()
const router = useRouter()
const { locale } = useI18n()
const { $services } = useNuxtApp()
const ui = useUiStore()
const { isMobileNavigationOpen } = storeToRefs(ui)
const { toggle, close } = ui
const cart = useCartStore()
const search = ref('')
const { data: categoryMenu } = await useAsyncData('header-category-menu', () => $services.categories.listTree(locale.value), { watch: [locale] })

onMounted(() => { if (!cart.loaded) cart.refresh($services.orders).catch(() => {}) })
watch(() => router.currentRoute.value.fullPath, close)

function submitSearch() {
  const query = search.value.trim()
  close()
  router.push(localePath({ path: '/products', query: query ? { q: query } : {} }))
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white text-charcoal">
    <header class="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-xl">
      <div class="bg-brown text-white">
        <div class="mx-auto flex h-8 max-w-7xl items-center justify-center px-4 text-[11px] font-medium tracking-wide sm:justify-between sm:px-6 lg:px-8">
          <span>{{ $t('shop.topbarMessage') }}</span>
          <span class="hidden opacity-75 sm:inline">{{ $t('shop.topbarAside') }}</span>
        </div>
      </div>

      <div class="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <NuxtLink :to="localePath('/')" class="flex shrink-0 items-center gap-2.5 text-lg font-bold text-brown sm:text-xl" @click="close">
          <span class="grid size-11 place-items-center rounded-2xl bg-cream text-brown">
            <svg viewBox="0 0 36 36" class="size-7" fill="none" aria-hidden="true"><path d="M18 29C10.6 25.8 7.6 20.8 8.2 14.2c5.6.2 10.2 3.9 10.8 9.1.6-5.2 5.2-8.9 10.8-9.1.6 6.6-2.4 11.6-9.8 14.8" fill="#2d745b"/><path d="M18 26V8m0 6c-2.1-3-4.5-4.3-7.5-4.4M18 17c2.1-3 4.5-4.3 7.5-4.4" stroke="#153b34" stroke-width="2" stroke-linecap="round"/></svg>
          </span>
          <span>{{ $t('brand.name') }}</span>
        </NuxtLink>

        <form class="search-shell mx-auto hidden w-full max-w-xl items-center rounded-full border border-border bg-[#f7faf8] p-1.5 transition duration-200 focus-within:bg-white md:flex" role="search" @submit.prevent="submitSearch">
          <svg viewBox="0 0 24 24" class="ms-3 size-5 shrink-0 text-muted" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>
          <input v-model="search" :placeholder="$t('shop.searchPlaceholder')" :aria-label="$t('shop.searchPlaceholder')" class="search-field min-w-0 flex-1 rounded-full border-0 bg-transparent px-3 text-sm outline-none placeholder:text-muted/75">
          <button type="submit" class="rounded-full bg-brown px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#2d745b]">{{ $t('actions.search') }}</button>
        </form>

        <div class="ms-auto flex items-center gap-2 md:ms-0">
          <CommonLanguageSwitcher />
          <NuxtLink :to="localePath('/cart')" class="relative grid size-10 place-items-center rounded-full border border-border text-brown transition hover:border-brown/35 hover:bg-cream" :aria-label="$t('navigation.cart')">
            <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3.5 5h2l1.7 10.5h10.5l2-7.5H6.1"/><circle cx="9" cy="19" r="1"/><circle cx="17" cy="19" r="1"/></svg>
            <span v-if="cart.itemCount" class="absolute -end-1 -top-1 flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white">{{ cart.itemCount > 99 ? '99+' : cart.itemCount }}</span>
          </NuxtLink>
          <button type="button" class="grid size-10 place-items-center rounded-full border border-border text-brown md:hidden" :aria-label="$t('navigation.menu')" :aria-expanded="isMobileNavigationOpen" aria-controls="mobile-navigation" @click="toggle">
            <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
        </div>
      </div>

      <div class="hidden border-t border-border/70 md:block">
        <nav class="mx-auto flex h-12 max-w-7xl items-center gap-8 px-4 text-[13px] font-semibold text-charcoal sm:px-6 lg:px-8" :aria-label="$t('navigation.menu')">
          <NuxtLink :to="localePath('/')" class="transition hover:text-brown">{{ $t('navigation.home') }}</NuxtLink>
          <StorefrontCategoryMenu v-if="categoryMenu?.length" :items="categoryMenu" compact />
          <NuxtLink v-else :to="localePath('/categories')" class="transition hover:text-brown">{{ $t('navigation.categories') }}</NuxtLink>
          <NuxtLink :to="localePath('/products')" class="transition hover:text-brown">{{ $t('navigation.products') }}</NuxtLink>
        </nav>
      </div>

      <div v-if="isMobileNavigationOpen" id="mobile-navigation" class="max-h-[calc(100vh-7rem)] overflow-y-auto border-t border-border bg-white px-4 py-4 shadow-soft md:hidden">
        <form class="search-shell mb-4 flex items-center rounded-full border border-border bg-cream p-1 transition duration-200" role="search" @submit.prevent="submitSearch">
          <input v-model="search" :placeholder="$t('shop.searchPlaceholder')" :aria-label="$t('shop.searchPlaceholder')" class="search-field min-w-0 flex-1 rounded-full border-0 bg-transparent px-4 py-2 text-sm outline-none">
          <button type="submit" class="rounded-full bg-brown px-4 py-2 text-xs font-semibold text-white">{{ $t('actions.search') }}</button>
        </form>
        <nav class="grid gap-1 text-sm font-semibold" :aria-label="$t('navigation.menu')">
          <NuxtLink :to="localePath('/')" class="rounded-xl px-3 py-3 hover:bg-cream" @click="close">{{ $t('navigation.home') }}</NuxtLink>
          <NuxtLink :to="localePath('/products')" class="rounded-xl px-3 py-3 hover:bg-cream" @click="close">{{ $t('navigation.products') }}</NuxtLink>
          <NuxtLink :to="localePath('/categories')" class="rounded-xl px-3 py-3 hover:bg-cream" @click="close">{{ $t('navigation.categories') }}</NuxtLink>
          <StorefrontCategoryMenu v-if="categoryMenu?.length" :items="categoryMenu" @navigate="close" />
        </nav>
      </div>
    </header>

    <main class="flex-1"><slot /></main>

    <SiteFooter :categories="categoryMenu ?? []" />
  </div>
</template>
