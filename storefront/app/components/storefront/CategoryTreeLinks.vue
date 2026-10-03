<script setup lang="ts">
import { categoryPath, type CategoryTreeItem } from '~/services/api/categories.service'

withDefaults(defineProps<{ items: CategoryTreeItem[], depth?: number }>(), { depth: 0 })
const emit = defineEmits<{ navigate: [] }>()
const localePath = useLocalePath()
</script>

<template>
  <ul class="grid gap-1" :class="depth ? 'mt-1 border-r border-border pr-3' : ''">
    <li v-for="item in items" :key="item.id">
      <NuxtLink
        :to="localePath(categoryPath(item))"
        class="group/link flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition duration-200 hover:bg-off-white hover:text-brown"
        @click="emit('navigate')"
      >
        <span class="flex items-center gap-2.5">
          <span class="size-1.5 rounded-full bg-gold/55 transition group-hover/link:scale-125 group-hover/link:bg-gold" />
          {{ item.name }}
        </span>
        <svg viewBox="0 0 24 24" class="size-3.5 opacity-0 transition group-hover/link:opacity-100 rtl:-scale-x-100" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </NuxtLink>
      <StorefrontCategoryTreeLinks v-if="item.children.length" :items="item.children" :depth="depth + 1" @navigate="emit('navigate')" />
    </li>
  </ul>
</template>
