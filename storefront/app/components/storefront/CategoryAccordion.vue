<script setup lang="ts">
import { categoryPath, type CategoryTreeItem } from '~/services/api/categories.service'

const props = defineProps<{ items: CategoryTreeItem[] }>()
const localePath = useLocalePath()
const firstExpandable = () => props.items.find(item => item.children.length)?.id ?? null
const openItem = ref<string | null>(firstExpandable())

watch(() => props.items, () => {
  if (!props.items.some(item => item.id === openItem.value)) openItem.value = firstExpandable()
})

function toggle(item: CategoryTreeItem) {
  if (!item.children.length) return
  openItem.value = openItem.value === item.id ? null : item.id
}
</script>

<template>
  <div class="overflow-hidden rounded-[1.75rem] border border-border/90 bg-off-white shadow-[0_20px_55px_rgb(61_41_30/8%)]">
    <article v-for="(item, index) in items" :key="item.id" class="border-b border-border/75 last:border-0">
      <NuxtLink v-if="!item.children.length" :to="localePath(categoryPath(item))" class="group flex items-center gap-4 px-5 py-5 transition hover:bg-cream/70 sm:px-6">
        <span class="grid size-9 shrink-0 place-items-center rounded-full bg-cream text-xs font-bold text-gold">{{ String(index + 1).padStart(2, '0') }}</span>
        <span class="flex-1 font-semibold text-brown">{{ item.name }}</span>
        <svg viewBox="0 0 24 24" class="size-4 text-muted transition group-hover:text-gold rtl:-scale-x-100" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </NuxtLink>

      <template v-else>
        <button type="button" class="group flex w-full items-center gap-4 px-5 py-5 text-start transition hover:bg-cream/55 sm:px-6" :aria-expanded="openItem === item.id" :aria-controls="`category-panel-${item.id}`" @click="toggle(item)">
          <span class="grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold transition" :class="openItem === item.id ? 'bg-gold text-white' : 'bg-cream text-gold'">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="min-w-0 flex-1"><span class="block font-semibold text-brown">{{ item.name }}</span><span class="mt-0.5 block text-xs text-muted">{{ $t('shop.childCount', { count: item.children.length }) }}</span></span>
          <span class="grid size-9 shrink-0 place-items-center rounded-full border transition duration-300" :class="openItem === item.id ? 'rotate-45 border-brown bg-brown text-off-white' : 'border-border text-brown group-hover:border-gold'">
            <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" /></svg>
          </span>
        </button>
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="-translate-y-2 opacity-0" leave-active-class="transition duration-200 ease-in" leave-to-class="-translate-y-2 opacity-0">
          <div v-if="openItem === item.id" :id="`category-panel-${item.id}`" class="border-t border-border/60 bg-cream/45 px-5 pb-5 pt-4 sm:px-6">
            <StorefrontCategoryTreeLinks :items="item.children" />
            <NuxtLink :to="localePath(categoryPath(item))" class="mt-3 inline-flex items-center gap-2 rounded-full bg-brown px-4 py-2 text-xs font-semibold text-off-white transition hover:bg-charcoal">
              {{ $t('shop.viewCollection', { name: item.name }) }}
              <svg viewBox="0 0 24 24" class="size-3.5 rtl:-scale-x-100" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </NuxtLink>
          </div>
        </Transition>
      </template>
    </article>
  </div>
</template>
