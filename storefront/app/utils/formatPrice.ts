/** Vendure's default MoneyStrategy sends prices in hundredths of a currency unit. */
export function formatPrice(amount: number, currencyCode: string, locale: string): string {
  const displayLocale = locale === 'fa' ? 'fa-IR' : 'en-US'

  if (currencyCode === 'IRR') {
    const formatted = new Intl.NumberFormat(displayLocale, {
      maximumFractionDigits: 0,
    }).format(amount / 100)
    return `${formatted} تومان`
  }

  return new Intl.NumberFormat(displayLocale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount / 100)
}
