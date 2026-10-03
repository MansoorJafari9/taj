<script setup lang="ts">
const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
</script>

<template>
  <NuxtLink
    :to="switchLocalePath(locale === 'fa' ? 'en' : 'fa')"
    class="rounded-md border border-border px-2.5 py-1.5 font-medium text-brown transition-colors hover:border-gold"
    :lang="locale === 'fa' ? 'en' : 'fa'"
  >
    {{ locale === 'fa' ? 'EN' : 'فا' }}
  </NuxtLink>
</template>
