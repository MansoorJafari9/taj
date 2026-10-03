import { toValue, type MaybeRefOrGetter } from 'vue'

export function useTajSeo(input: { title: MaybeRefOrGetter<string>, description: MaybeRefOrGetter<string> }) {
  const config = useRuntimeConfig()
  const route = useRoute()

  useSeoMeta({
    title: () => toValue(input.title),
    description: () => toValue(input.description),
    ogTitle: () => toValue(input.title),
    ogDescription: () => toValue(input.description),
    ogUrl: () => new URL(route.fullPath, config.public.siteUrl).toString(),
  })
}
