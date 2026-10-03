<script setup lang="ts">
const props = defineProps<{ open: boolean, title: string }>()
const emit = defineEmits<{ close: [] }>()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')

watch(() => props.open, (open) => {
  if (open) dialog.value?.showModal()
  else dialog.value?.close()
})

onMounted(() => {
  if (props.open) dialog.value?.showModal()
})
</script>

<template>
  <dialog ref="dialog" class="m-auto w-[min(32rem,calc(100%-2rem))] rounded-lg bg-off-white p-0 text-charcoal shadow-2xl backdrop:bg-charcoal/45" @close="emit('close')">
    <div class="flex items-center justify-between border-b border-border px-5 py-4">
      <h2 class="font-semibold text-brown">{{ title }}</h2>
      <button type="button" class="rounded p-2 text-muted hover:text-charcoal" :aria-label="$t('actions.close')" @click="emit('close')">×</button>
    </div>
    <div class="p-5"><slot /></div>
  </dialog>
</template>
