<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { MAX_COMPARE_PRODUCTS } from '~/stores/saved-products'

const props = withDefaults(defineProps<{ productId: string, compact?: boolean }>(), { compact: false })
const saved = useSavedProductsStore()
const { favoriteIds, compareIds } = storeToRefs(saved)
const { t } = useI18n()
const localePath = useLocalePath()
const compareFull = ref(false)
const isFavorite = computed(() => favoriteIds.value.includes(props.productId))
const isCompared = computed(() => compareIds.value.includes(props.productId))

function toggleCompare() {
  compareFull.value = saved.toggleCompare(props.productId) === 'full'
}
</script>

<template>
  <div class="flex gap-2" :class="compact ? 'flex-col' : 'flex-wrap items-center'">
    <button
      type="button"
      :aria-label="isFavorite ? t('saved.removeFavorite') : t('saved.addFavorite')"
      :aria-pressed="isFavorite"
      :title="isFavorite ? t('saved.removeFavorite') : t('saved.addFavorite')"
      class="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white/95 text-brown shadow-sm backdrop-blur transition hover:border-brown/40 hover:bg-white"
      :class="compact ? 'size-9' : 'h-11 px-4 text-sm font-semibold'"
      @click="saved.toggleFavorite(productId)"
    >
      <svg viewBox="0 0 24 24" class="size-5" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20.8 8.3c0 4.4-8.8 10.1-8.8 10.1S3.2 12.7 3.2 8.3a4.6 4.6 0 0 1 8.8-1.8 4.6 4.6 0 0 1 8.8 1.8Z" /></svg>
      <span v-if="!compact">{{ isFavorite ? $t('saved.inFavorites') : $t('saved.addFavorite') }}</span>
    </button>
    <button
      type="button"
      :aria-label="isCompared ? t('saved.removeCompare') : t('saved.addCompare')"
      :aria-pressed="isCompared"
      :title="isCompared ? t('saved.removeCompare') : t('saved.addCompare')"
      class="inline-flex items-center justify-center gap-2 rounded-full border bg-white/95 text-brown shadow-sm backdrop-blur transition hover:bg-white"
      :class="[compact ? 'size-9' : 'h-11 px-4 text-sm font-semibold', isCompared ? 'border-brown bg-cream' : 'border-border hover:border-brown/40']"
      @click="toggleCompare"
    >
      <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v17M5 7h14M5 7 2.5 13h5L5 7Zm14 0-2.5 6h5L19 7ZM9 20h6M8 16h8" /></svg>
      <span v-if="!compact">{{ isCompared ? $t('saved.inCompare') : $t('saved.addCompare') }}</span>
    </button>
    <NuxtLink v-if="compareFull" :to="localePath('/compare')" class="rounded-full bg-brown px-3 py-1.5 text-xs font-bold text-white" :class="compact ? 'absolute start-0 top-20 w-36 text-center' : ''" @click="compareFull = false">{{ $t('saved.compareFull', { count: MAX_COMPARE_PRODUCTS }) }}</NuxtLink>
  </div>
</template>
