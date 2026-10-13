<script setup lang="ts">
import { contentAsText, sanitizeContent } from '~/utils/sanitizeContent'

const { t } = useI18n()
const siteName = useSiteName()
const { data: settings } = useSiteSettings()
const content = computed(() => sanitizeContent(settings.value?.aboutContent))

useTajSeo({
  title: computed(() => `${t('navigation.about')} | ${siteName.value}`),
  description: computed(() => contentAsText(settings.value?.aboutContent).slice(0, 160) || t('navigation.about')),
})
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
    <div class="mb-10 border-b border-border pb-8">
      <p class="text-xs font-bold tracking-widest text-gold">{{ siteName }}</p>
      <h1 class="mt-3 text-4xl font-bold text-brown sm:text-5xl">{{ $t('navigation.about') }}</h1>
    </div>
    <article v-if="content" class="max-w-3xl whitespace-pre-line text-base leading-9 text-charcoal [&_a]:text-brown [&_a]:underline [&_blockquote]:border-s-2 [&_blockquote]:border-border [&_blockquote]:ps-4 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-bold [&_li]:ms-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p+p]:mt-5" v-html="content" />
    <p v-else class="text-muted">{{ $t('shop.aboutEmpty') }}</p>
  </div>
</template>
