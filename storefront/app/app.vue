<script setup lang="ts">
const { direction, languageTag } = useDirection()

useHead({
  htmlAttrs: {
    dir: direction,
    lang: languageTag,
  },
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator color="var(--color-gold)" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
