<script setup lang="ts">
const localePath = useLocalePath()
</script>

<template>
  <section class="border-t border-border bg-[#f5f9f6] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
    <div class="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#133e34] text-white shadow-[0_28px_70px_rgb(14_58_44/18%)] sm:rounded-[2.75rem]">
      <div class="pointer-events-none absolute -end-20 -top-28 size-80 rounded-full border border-white/10 sm:size-[32rem]" aria-hidden="true" />
      <div class="pointer-events-none absolute -end-12 -top-20 size-64 rounded-full border border-white/10 sm:size-[26rem]" aria-hidden="true" />
      <div class="pointer-events-none absolute -bottom-52 end-28 size-96 rounded-full bg-[#276c53]/60 blur-3xl" aria-hidden="true" />
      <div class="relative grid gap-10 px-7 py-12 sm:px-12 sm:py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:gap-16 lg:px-20 lg:py-20">
        <div class="max-w-2xl">
          <span class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-[#d6e9db]"><span class="size-1.5 rounded-full bg-[#d9ad66]" />{{ $t('shop.storyEyebrow') }}</span>
          <h2 class="mt-7 text-3xl font-bold leading-[1.5] tracking-tight sm:text-4xl lg:text-[2.8rem]">{{ $t('shop.storyTitle') }}</h2>
          <p class="mt-5 max-w-xl text-sm leading-8 text-[#c2d9cd] sm:text-base">{{ $t('shop.storyDescription') }}</p>
          <div class="mt-8 flex flex-wrap gap-3">
            <NuxtLink :to="localePath('/products')" class="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#164735] transition hover:-translate-y-0.5 hover:bg-[#eaf5ec]">{{ $t('actions.explore') }}<svg viewBox="0 0 24 24" class="size-4 rtl:-scale-x-100" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></NuxtLink>
            <NuxtLink :to="localePath('/categories')" class="inline-flex items-center rounded-full border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">{{ $t('shop.collections') }}</NuxtLink>
          </div>
        </div>

        <div class="relative mx-auto w-full max-w-sm lg:max-w-none" aria-hidden="true">
          <div class="absolute inset-8 rounded-full bg-[#e4b46d]/15 blur-2xl" />
          <div class="relative flex aspect-square items-center justify-center rounded-full border border-white/15 bg-[radial-gradient(circle_at_30%_25%,#3b8564_0%,#1e5c47_46%,#174535_75%)] shadow-[inset_0_1px_0_rgb(255_255_255/12%),0_30px_60px_rgb(0_0_0/15%)]">
            <svg viewBox="0 0 360 360" class="w-[82%] max-w-[350px] drop-shadow-[0_20px_20px_rgb(0_0_0/15%)]" fill="none">
              <circle cx="180" cy="180" r="120" stroke="#d5e8d8" stroke-opacity=".35" />
              <circle cx="180" cy="180" r="90" stroke="#d5e8d8" stroke-opacity=".2" />
              <path d="M180 285c-58-28-87-69-77-129 47 3 77 27 77 67 0-40 30-64 77-67 10 60-19 101-77 129Z" fill="#e6eee2" />
              <path d="M180 257V74m0 107c-15-39-45-58-82-60m82 81c15-39 45-58 82-60" stroke="#d8ad6d" stroke-width="10" stroke-linecap="round" />
              <circle cx="77" cy="92" r="6" fill="#d8ad6d" /><circle cx="287" cy="102" r="5" fill="#d8ad6d" /><circle cx="279" cy="279" r="7" fill="#d8ad6d" />
            </svg>
          </div>
          <div class="absolute -bottom-3 start-0 rotate-[-7deg] rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-sm font-bold text-[#1d6048] shadow-xl sm:start-2">{{ $t('shop.storySeal') }}</div>
        </div>
      </div>
    </div>

    <div class="mx-auto mt-6 grid max-w-7xl gap-3 sm:grid-cols-3">
      <div v-for="(feature, index) in ['storyFeatureChoice', 'storyFeatureWeight', 'storyFeatureDiscovery']" :key="feature" class="flex items-start gap-4 rounded-[1.35rem] border border-[#e2ece5] bg-white p-5 sm:p-6">
        <span class="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e9f4ec] text-[#286d50]" aria-hidden="true">
          <svg v-if="index === 0" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-8-4.5-8-10.5a4.5 4.5 0 0 1 8-2.8 4.5 4.5 0 0 1 8 2.8C20 16.5 12 21 12 21Z" /></svg>
          <svg v-else-if="index === 1" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 20h14l-2-12H7L5 20ZM9 8V6a3 3 0 0 1 6 0v2" /></svg>
          <svg v-else viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5M8 11h6m-3-3v6" /></svg>
        </span>
        <div><h3 class="text-sm font-bold text-[#1a4737]">{{ $t(`shop.${feature}`) }}</h3><p class="mt-1.5 text-xs leading-6 text-muted">{{ $t(`shop.${feature}Description`) }}</p></div>
      </div>
    </div>
  </section>
</template>
