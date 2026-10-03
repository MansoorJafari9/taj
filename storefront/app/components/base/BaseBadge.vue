<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'neutral' | 'success' | 'danger' }>(), { tone: 'neutral' })
</script>

<template>
  <span
    class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
    :class="{
      'bg-beige text-brown': tone === 'neutral',
      'bg-success/10 text-success': tone === 'success',
      'bg-danger/10 text-danger': tone === 'danger',
    }"
  ><slot /></span>
</template>
