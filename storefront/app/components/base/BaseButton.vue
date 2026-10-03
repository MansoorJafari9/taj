<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
  disabled?: boolean
}>(), { type: 'button', variant: 'primary', loading: false, disabled: false })
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55"
    :class="{
      'bg-brown text-off-white hover:bg-charcoal': variant === 'primary',
      'border border-border bg-off-white text-brown hover:border-gold': variant === 'secondary',
      'text-brown hover:bg-cream': variant === 'ghost',
    }"
  >
    <span v-if="loading" aria-hidden="true" class="me-2 size-4 animate-spin rounded-full border-2 border-current border-e-transparent" />
    <span class="sr-only" aria-live="polite">{{ loading ? $t('states.loading') : '' }}</span>
    <slot />
  </button>
</template>
