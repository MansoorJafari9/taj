<script setup lang="ts">
import { contentAsText, sanitizeContent } from '~/utils/sanitizeContent'

const { t } = useI18n()
const siteName = useSiteName()
const { data: settings } = useSiteSettings()
const content = computed(() => sanitizeContent(settings.value?.contactContent))
const phoneHref = computed(() => `tel:${(settings.value?.contactPhone ?? '').replace(/[^\d+]/g, '')}`)

useTajSeo({
  title: computed(() => `${t('navigation.contact')} | ${siteName.value}`),
  description: computed(() => contentAsText(settings.value?.contactContent).slice(0, 160) || t('navigation.contact')),
})
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
    <div class="mb-10 border-b border-border pb-8">
      <p class="text-xs font-bold tracking-widest text-gold">{{ siteName }}</p>
      <h1 class="mt-3 text-4xl font-bold text-brown sm:text-5xl">{{ $t('navigation.contact') }}</h1>
    </div>
    <div class="grid gap-8 md:grid-cols-[1fr_18rem]">
      <article v-if="content" class="whitespace-pre-line text-base leading-9 text-charcoal [&_a]:text-brown [&_a]:underline [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_li]:ms-5 [&_li]:list-disc [&_p+p]:mt-4" v-html="content" />
      <p v-else class="text-muted">{{ $t('shop.contactEmpty') }}</p>
      <aside v-if="settings?.contactEmail || settings?.contactPhone || settings?.contactAddress" class="h-fit space-y-5 rounded-[1.5rem] border border-border bg-[#f8fbf9] p-6">
        <div v-if="settings.contactPhone"><h2 class="mb-1 text-xs font-bold text-muted">{{ $t('shop.contactPhone') }}</h2><a :href="phoneHref" class="font-semibold text-brown hover:underline" dir="ltr">{{ settings.contactPhone }}</a></div>
        <div v-if="settings.contactEmail"><h2 class="mb-1 text-xs font-bold text-muted">{{ $t('shop.contactEmail') }}</h2><a :href="`mailto:${settings.contactEmail}`" class="break-all font-semibold text-brown hover:underline" dir="ltr">{{ settings.contactEmail }}</a></div>
        <div v-if="settings.contactAddress"><h2 class="mb-1 text-xs font-bold text-muted">{{ $t('shop.contactAddress') }}</h2><p class="whitespace-pre-line leading-7 text-charcoal">{{ settings.contactAddress }}</p></div>
      </aside>
    </div>
  </div>
</template>
