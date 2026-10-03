<script setup lang="ts">
defineProps<{ title: string, description?: string }>()
</script>

<template>
  <section class="mx-auto max-w-lg rounded-lg border border-border bg-off-white p-8 text-center">
    <h2 class="text-lg font-semibold text-brown">{{ title }}</h2>
    <p v-if="description" class="mt-2 text-sm leading-6 text-muted">{{ description }}</p>
    <div v-if="$slots.default" class="mt-5"><slot /></div>
  </section>
</template>
