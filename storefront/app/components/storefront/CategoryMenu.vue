<script setup lang="ts">
import { categoryPath, type CategoryTreeItem } from '~/services/api/categories.service'

defineProps<{ items: CategoryTreeItem[], compact?: boolean }>()
const emit = defineEmits<{ navigate: [] }>()
const localePath = useLocalePath()
const openItem = ref<string | null>(null)

function toggle(itemId: string) {
  openItem.value = openItem.value === itemId ? null : itemId
}
</script>

<template>
  <div :class="compact ? '' : 'rounded-[1.5rem] border border-border bg-off-white p-2 shadow-soft'" :aria-label="$t('navigation.categories')">
    <div v-if="compact" class="group relative">
      <NuxtLink :to="localePath('/categories')" class="inline-flex items-center gap-1.5 py-3 transition hover:text-gold">
        {{ $t('navigation.categories') }}
        <svg viewBox="0 0 24 24" class="size-3.5 transition duration-200 group-hover:rotate-180 group-focus-within:rotate-180" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6" /></svg>
      </NuxtLink>

      <div class="invisible absolute start-0 top-[calc(100%-0.25rem)] z-50 w-[36rem] translate-y-2 pt-4 opacity-0 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div class="grid grid-cols-2 gap-2 rounded-[1.5rem] border border-border bg-off-white p-3 text-start shadow-[0_22px_55px_rgb(61_41_30/14%)]">
          <section v-for="(item, index) in items" :key="item.id" class="rounded-2xl p-3 transition hover:bg-cream/65">
            <NuxtLink :to="localePath(categoryPath(item))" class="flex items-center gap-3 font-semibold text-brown">
              <span class="grid size-8 shrink-0 place-items-center rounded-full bg-cream text-[0.65rem] font-bold text-gold">{{ String(index + 1).padStart(2, '0') }}</span>
              {{ item.name }}
            </NuxtLink>
            <div v-if="item.children.length" class="mt-2 ps-8 text-xs font-normal"><StorefrontCategoryTreeLinks :items="item.children" /></div>
          </section>
          <NuxtLink :to="localePath('/categories')" class="col-span-2 mt-1 flex items-center justify-center gap-2 rounded-xl bg-brown px-4 py-2.5 text-xs font-semibold text-off-white transition hover:bg-charcoal">
            {{ $t('actions.viewAll') }}
            <svg viewBox="0 0 24 24" class="size-3.5 rtl:-scale-x-100" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </NuxtLink>
        </div>
      </div>
    </div>

    <template v-else>
      <div v-for="item in items" :key="item.id" class="border-b border-border/70 last:border-0">
        <div class="flex items-center justify-between gap-2">
          <NuxtLink :to="localePath(categoryPath(item))" class="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-brown transition hover:bg-cream" @click="emit('navigate')">{{ item.name }}</NuxtLink>
          <button v-if="item.children.length" type="button" class="grid size-10 place-items-center rounded-xl text-muted transition hover:bg-cream" :aria-expanded="openItem === item.id" @click="toggle(item.id)">
            <svg viewBox="0 0 24 24" class="size-4 transition" :class="openItem === item.id ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </div>
        <div v-if="openItem === item.id" class="px-4 pb-3"><StorefrontCategoryTreeLinks :items="item.children" @navigate="emit('navigate')" /></div>
      </div>
    </template>
  </div>
</template>
