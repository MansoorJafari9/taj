<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin'] })
</script>

<template>
  <BaseEmptyState :title="$t('admin.title')" :description="$t('placeholders.adminDescription')" />
</template>
