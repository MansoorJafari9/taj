<script setup lang="ts">
import { categoryPath, type CategorySummary } from '~/services/api/categories.service'

defineProps<{ category: CategorySummary, index: number }>()
const localePath = useLocalePath()
</script>

<template>
  <NuxtLink :to="localePath(categoryPath(category))" class="group block overflow-hidden rounded-[1.5rem] border border-border bg-white transition duration-300 hover:-translate-y-1 hover:border-[#c8dccf] hover:shadow-soft">
    <div class="relative aspect-[1.5] overflow-hidden bg-cream">
      <NuxtImg
        v-if="category.featuredAsset?.preview"
        :src="category.featuredAsset.preview"
        :alt="category.name"
        class="size-full object-cover transition duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        loading="lazy"
      />
      <div v-else class="grid size-full place-items-center bg-[radial-gradient(circle_at_80%_20%,#e0f0e2,#f3f8f5_60%)] text-[#4f936e]">
        <svg viewBox="0 0 64 64" class="size-20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M32 51c-12-4-18-13-18-27 11 1 18 6 18 17 0-11 7-16 18-17 0 14-6 23-18 27Zm0-5V13m0 11c-5-6-10-8-16-8m16 14c5-6 10-8 16-8" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </div>
      <span class="absolute end-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-brown shadow-sm">{{ String(index + 1).padStart(2, '0') }}</span>
    </div>
    <div class="flex items-center justify-between gap-3 px-5 py-4">
      <div><h3 class="text-base font-bold text-charcoal">{{ category.name }}</h3><p class="mt-1 text-xs text-muted">{{ $t('shop.exploreCollection') }}</p></div>
      <span class="grid size-9 place-items-center rounded-full bg-cream text-brown transition duration-300 group-hover:bg-brown group-hover:text-white" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="size-4 rtl:-scale-x-100" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </span>
    </div>
  </NuxtLink>
</template>
