<script setup lang="ts">
import type { BlogPost } from '~/services/api/blog.service'

const props = defineProps<{ post: BlogPost }>()
const localePath = useLocalePath()
const { locale } = useI18n()
const date = computed(() => props.post.publishedAt
  ? new Intl.DateTimeFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US', { dateStyle: 'medium' }).format(new Date(props.post.publishedAt))
  : '')
</script>

<template>
  <article class="group overflow-hidden rounded-[1.5rem] border border-border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-soft">
    <NuxtLink :to="localePath(`/blog/${post.slug}`)" class="block aspect-[1.65] overflow-hidden bg-[#e8f2ea]">
      <img v-if="post.coverImageUrl" :src="post.coverImageUrl" :alt="post.title" loading="lazy" class="size-full object-cover transition duration-500 group-hover:scale-105">
      <span v-else class="grid size-full place-items-center text-5xl text-brown/30">✦</span>
    </NuxtLink>
    <div class="p-5 sm:p-6">
      <div class="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted"><span v-if="post.category" class="text-gold">{{ post.category }}</span><time v-if="date" :datetime="post.publishedAt ?? undefined">{{ date }}</time></div>
      <h2 class="mt-3 text-lg font-bold leading-8 text-brown sm:text-xl"><NuxtLink :to="localePath(`/blog/${post.slug}`)" class="transition hover:text-[#2d745b]">{{ post.title }}</NuxtLink></h2>
      <p class="mt-3 line-clamp-3 text-sm leading-7 text-muted">{{ post.excerpt }}</p>
      <NuxtLink :to="localePath(`/blog/${post.slug}`)" class="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brown">{{ $t('blog.readMore') }} <span aria-hidden="true">←</span></NuxtLink>
    </div>
  </article>
</template>
