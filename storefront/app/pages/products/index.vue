<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const { $services } = useNuxtApp()
const localePath = useLocalePath()
const perPage = 12
const search = computed(() => typeof route.query.q === 'string' ? route.query.q.trim() : '')
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const searchDraft = ref(search.value)

watch(search, value => { searchDraft.value = value })
const { data, pending, error } = await useAsyncData(
  'products-catalog',
  () => $services.products.list({ locale: locale.value, skip: (page.value - 1) * perPage, take: perPage, search: search.value || undefined }),
  { watch: [locale, search, page] },
)
const products = computed(() => data.value?.items ?? [])
const totalItems = computed(() => data.value?.totalItems ?? 0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / perPage)))
function submitSearch() { router.push(localePath({ path: '/products', query: searchDraft.value ? { q: searchDraft.value } : {} })) }
function pageTo(target: number) { return localePath({ path: '/products', query: { ...(search.value ? { q: search.value } : {}), ...(target > 1 ? { page: String(target) } : {}) } }) }
useTajSeo({
  title: computed(() => `${t('shop.productsTitle')} | ${t('brand.name')}`),
  description: computed(() => t('shop.productsDescription')),
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="max-w-2xl"><p class="text-xs font-bold tracking-[0.16em] text-gold">{{ $t('navigation.products') }}</p><h1 class="mt-3 text-3xl font-bold tracking-tight text-brown sm:text-4xl">{{ $t('shop.productsTitle') }}</h1><p class="mt-3 text-muted">{{ $t('shop.productsDescription') }}</p></div>
    <form class="search-shell mt-8 flex max-w-xl rounded-full border border-border bg-off-white p-1.5 transition duration-200" role="search" @submit.prevent="submitSearch"><input v-model="searchDraft" :placeholder="$t('shop.searchPlaceholder')" :aria-label="$t('shop.searchPlaceholder')" class="search-field min-w-0 flex-1 rounded-full border-0 bg-transparent px-4 text-sm outline-none placeholder:text-muted/75"><button class="rounded-full bg-brown px-5 py-2.5 text-sm font-semibold text-off-white transition hover:bg-[#2d745b]" type="submit">{{ $t('actions.search') }}</button></form>
    <div class="mt-10 flex items-center justify-between border-b border-border pb-4 text-sm"><span class="font-medium text-brown">{{ $t('shop.results', { count: totalItems }) }}</span><span v-if="search" class="text-muted">“{{ search }}”</span></div>
    <div v-if="pending" class="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4"><BaseSkeleton v-for="item in perPage" :key="item" class="h-72 rounded-[1.4rem]" /></div>
    <div v-else-if="error" class="mt-8 rounded-2xl border border-danger/20 bg-red-50 p-5 text-sm text-danger">{{ $t('errors.generic') }}</div>
    <BaseEmptyState v-else-if="!products.length" class="mt-8" :title="$t('states.empty')" :description="$t('shop.noProducts')" />
    <div v-else class="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4"><StorefrontProductCard v-for="product in products" :key="product.id" :product="product" /></div>
    <nav v-if="totalPages > 1" class="mt-12 flex items-center justify-center gap-3" :aria-label="$t('shop.productsTitle')"><NuxtLink v-if="page > 1" :to="pageTo(page - 1)" class="rounded-full border border-border px-4 py-2 text-sm font-semibold">{{ $t('actions.previous') }}</NuxtLink><span class="text-sm text-muted">{{ page }} / {{ totalPages }}</span><NuxtLink v-if="page < totalPages" :to="pageTo(page + 1)" class="rounded-full border border-border px-4 py-2 text-sm font-semibold">{{ $t('actions.next') }}</NuxtLink></nav>
  </div>
</template>
