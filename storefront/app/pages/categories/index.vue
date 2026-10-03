<script setup lang="ts">
import type { CategoryTreeItem } from '~/services/api/categories.service'

const { t, locale } = useI18n()
const { $services } = useNuxtApp()

const { data, pending, error } = await useAsyncData(
  'collections-catalog',
  () => $services.categories.listTree(locale.value),
  { watch: [locale] },
)
function flattenCategories(items: CategoryTreeItem[]): CategoryTreeItem[] {
  return items.flatMap(item => [item, ...flattenCategories(item.children)])
}
const categories = computed(() => flattenCategories(data.value ?? []))
useTajSeo({ title: computed(() => `${t('shop.categoriesTitle')} | ${t('brand.name')}`), description: computed(() => t('shop.categoriesDescription')) })
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="max-w-2xl"><p class="text-xs font-bold tracking-[0.16em] text-gold">{{ $t('navigation.categories') }}</p><h1 class="mt-3 text-3xl font-bold tracking-tight text-brown sm:text-4xl">{{ $t('shop.categoriesTitle') }}</h1><p class="mt-3 text-muted">{{ $t('shop.categoriesDescription') }}</p></div>
    <div v-if="pending" class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><BaseSkeleton v-for="item in 6" :key="item" class="h-64 rounded-[1.5rem]" /></div>
    <div v-else-if="error" class="mt-10 rounded-2xl border border-danger/20 bg-red-50 p-5 text-sm text-danger">{{ $t('errors.generic') }}</div>
    <BaseEmptyState v-else-if="!categories.length" class="mt-10" :title="$t('states.empty')" :description="$t('shop.noCategories')" />
    <div v-else class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><StorefrontCategoryCard v-for="(category, index) in categories" :key="category.id" :category="category" :index="index" /></div>
  </div>
</template>
