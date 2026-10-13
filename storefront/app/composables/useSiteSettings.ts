import type { SiteSettings } from '~/services/api/site-settings.service'

export function useSiteSettings() {
  return useNuxtData<SiteSettings>('site-settings')
}

export function useSiteName() {
  const { data } = useSiteSettings()
  const { t } = useI18n()
  return computed(() => data.value?.siteName?.trim() || t('brand.name'))
}
