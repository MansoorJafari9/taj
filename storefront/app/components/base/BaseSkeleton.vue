<script setup lang="ts">
withDefaults(defineProps<{ class?: string }>(), { class: 'h-5 w-full' })
</script>

<template>
  <div :class="['animate-pulse rounded-md bg-beige', $props.class]" aria-hidden="true" />
</template>
