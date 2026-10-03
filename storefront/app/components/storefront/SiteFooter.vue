<script setup lang="ts">
import type { CategoryTreeItem } from '~/services/api/categories.service'
import { categoryPath } from '~/services/api/categories.service'

defineProps<{ categories: CategoryTreeItem[] }>()
const localePath = useLocalePath()
const year = new Date().getFullYear()

function backToTop() {
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
</script>

<template>
  <footer class="relative isolate overflow-hidden bg-[#102f29] text-white">
    <div class="pointer-events-none absolute -bottom-28 -end-20 size-[32rem] rounded-full border border-white/[.06]" aria-hidden="true" />
    <div class="pointer-events-none absolute -bottom-44 -end-40 size-[38rem] rounded-full border border-white/[.04]" aria-hidden="true" />

    <div class="relative mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
      <div class="flex flex-col gap-7 border-b border-white/15 pb-12 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-2xl">
          <p class="inline-flex items-center gap-2 text-xs font-semibold text-[#d4ad72]"><span class="size-1.5 rounded-full bg-[#d4ad72]" />{{ $t('shop.footerEyebrow') }}</p>
          <h2 class="mt-4 text-3xl font-bold leading-[1.45] tracking-tight sm:text-4xl">{{ $t('shop.footerTitle') }}</h2>
        </div>
        <NuxtLink :to="localePath('/products')" class="inline-flex w-fit items-center gap-3 rounded-full border border-white/25 px-5 py-3 text-sm font-bold transition hover:border-white/60 hover:bg-white/10">{{ $t('shop.footerExplore') }}<svg viewBox="0 0 24 24" class="size-4 rtl:-scale-x-100" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></NuxtLink>
      </div>

      <div class="grid gap-x-10 gap-y-12 py-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_.65fr_.65fr_1fr] lg:py-16">
        <div class="max-w-xs">
          <NuxtLink :to="localePath('/')" class="inline-flex items-center gap-3 text-xl font-bold tracking-tight" :aria-label="$t('brand.name')">
            <span class="grid size-12 place-items-center rounded-2xl border border-white/15 bg-white/10">
              <svg viewBox="0 0 36 36" class="size-7" fill="none" aria-hidden="true"><path d="M18 29C10.6 25.8 7.6 20.8 8.2 14.2c5.6.2 10.2 3.9 10.8 9.1.6-5.2 5.2-8.9 10.8-9.1.6 6.6-2.4 11.6-9.8 14.8" fill="#dcead9"/><path d="M18 26V8m0 6c-2.1-3-4.5-4.3-7.5-4.4M18 17c2.1-3 4.5-4.3 7.5-4.4" stroke="#d8ad6d" stroke-width="2" stroke-linecap="round"/></svg>
            </span>
            {{ $t('brand.name') }}
          </NuxtLink>
          <p class="mt-5 text-sm leading-8 text-[#bad1c5]">{{ $t('shop.footerDescription') }}</p>
          <div class="mt-6 flex flex-wrap gap-2 text-[11px] font-semibold text-[#dce9df]"><span v-for="flavour in ['heroNut', 'heroDried', 'heroChocolate']" :key="flavour" class="rounded-full border border-white/15 px-3 py-1.5">{{ $t(`shop.${flavour}`) }}</span></div>
        </div>

        <nav :aria-label="$t('shop.footerExplore')">
          <h3 class="text-sm font-bold text-white">{{ $t('shop.footerExplore') }}</h3>
          <ul class="mt-5 space-y-3.5 text-sm text-[#bad1c5]">
            <li><NuxtLink :to="localePath('/')" class="transition hover:text-white">{{ $t('navigation.home') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/products')" class="transition hover:text-white">{{ $t('navigation.products') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/categories')" class="transition hover:text-white">{{ $t('navigation.categories') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/cart')" class="transition hover:text-white">{{ $t('navigation.cart') }}</NuxtLink></li>
          </ul>
        </nav>

        <nav v-if="categories.length" :aria-label="$t('shop.footerCategories')">
          <h3 class="text-sm font-bold text-white">{{ $t('shop.footerCategories') }}</h3>
          <ul class="mt-5 space-y-3.5 text-sm text-[#bad1c5]">
            <li v-for="category in categories.slice(0, 5)" :key="category.id"><NuxtLink :to="localePath(categoryPath(category))" class="transition hover:text-white">{{ category.name }}</NuxtLink></li>
          </ul>
        </nav>

        <div class="rounded-[1.5rem] border border-white/15 bg-white/[.06] p-6 sm:col-span-2 lg:col-span-1">
          <span class="grid size-10 place-items-center rounded-xl bg-[#d5ad70] text-[#153b30]" aria-hidden="true"><svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg></span>
          <h3 class="mt-5 text-base font-bold">{{ $t('shop.footerFindTitle') }}</h3>
          <p class="mt-2 text-xs leading-7 text-[#bad1c5]">{{ $t('shop.footerFindDescription') }}</p>
          <NuxtLink :to="localePath('/products')" class="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#e9c58f] transition hover:text-white">{{ $t('actions.search') }}<svg viewBox="0 0 24 24" class="size-4 rtl:-scale-x-100" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></NuxtLink>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-[#a8c2b5]">
        <p>© {{ year }} {{ $t('brand.name') }}. {{ $t('shop.footerCopyright') }}</p>
        <button type="button" class="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 font-semibold text-white transition hover:bg-white/10" @click="backToTop">{{ $t('shop.backToTop') }}<svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 20V4m-6 6 6-6 6 6" /></svg></button>
      </div>
    </div>
  </footer>
</template>
