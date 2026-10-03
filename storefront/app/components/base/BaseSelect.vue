<script setup lang="ts">
defineProps<{ label: string, name: string, options: Array<{ label: string, value: string }>, error?: string }>()
const model = defineModel<string>({ default: '' })
const selectId = useId()
</script>

<template>
  <label :for="selectId" class="grid gap-1.5 text-sm font-medium text-charcoal">
    <span>{{ label }}</span>
    <select
      :id="selectId"
      v-model="model"
      :name="name"
      :aria-invalid="Boolean(error)"
      class="min-h-11 rounded-md border border-border bg-off-white px-3.5 text-base outline-none focus:border-gold"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <span v-if="error" class="text-sm text-danger">{{ error }}</span>
  </label>
</template>
