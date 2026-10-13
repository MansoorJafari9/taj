<script setup lang="ts">
const { direction, languageTag } = useDirection()
const { $services } = useNuxtApp()
const { data: siteSettings } = await useAsyncData('site-settings', () => $services.siteSettings.get())

useHead({
  htmlAttrs: {
    dir: direction,
    lang: languageTag,
  },
  link: () => siteSettings.value?.faviconUrl ? [{ rel: 'icon', href: siteSettings.value.faviconUrl }] : [],
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator color="var(--color-gold)" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
