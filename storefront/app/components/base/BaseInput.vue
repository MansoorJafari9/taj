<script setup lang="ts">
defineProps<{ label: string, name: string, type?: string, error?: string, placeholder?: string }>()
const model = defineModel<string>({ default: '' })
const inputId = useId()
</script>

<template>
  <label :for="inputId" class="grid gap-1.5 text-sm font-medium text-charcoal">
    <span>{{ label }}</span>
    <input
      :id="inputId"
      v-model="model"
      :name="name"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${inputId}-error` : undefined"
      class="min-h-11 rounded-md border border-border bg-off-white px-3.5 text-base outline-none transition-colors focus:border-gold"
    >
    <span v-if="error" :id="`${inputId}-error`" class="text-sm text-danger">{{ error }}</span>
  </label>
</template>
