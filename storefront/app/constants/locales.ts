export const supportedLocales = ['fa', 'en'] as const

export type SupportedLocale = (typeof supportedLocales)[number]
export type TextDirection = 'rtl' | 'ltr'

export const localeConfig: Record<SupportedLocale, { languageTag: string, direction: TextDirection }> = {
  fa: { languageTag: 'fa-IR', direction: 'rtl' },
  en: { languageTag: 'en-US', direction: 'ltr' },
}

export function isSupportedLocale(value: string): value is SupportedLocale {
  return supportedLocales.includes(value as SupportedLocale)
}
