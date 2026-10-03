import { computed } from 'vue'
import { isSupportedLocale, localeConfig } from '~/constants/locales'

export function useDirection() {
  const { locale } = useI18n()

  const activeLocale = computed(() => isSupportedLocale(locale.value) ? locale.value : 'fa')
  const direction = computed(() => localeConfig[activeLocale.value].direction)
  const languageTag = computed(() => localeConfig[activeLocale.value].languageTag)

  return { activeLocale, direction, languageTag }
}
