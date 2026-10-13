type StatusTone = 'neutral' | 'success' | 'warning' | 'danger'

const statuses: Record<string, { fa: string, en: string, tone: StatusTone }> = {
  Created: { fa: 'سبد خرید', en: 'Cart', tone: 'neutral' },
  AddingItems: { fa: 'در حال تکمیل سفارش', en: 'Building order', tone: 'neutral' },
  ArrangingPayment: { fa: 'در انتظار پرداخت', en: 'Awaiting payment', tone: 'warning' },
  PaymentAuthorized: { fa: 'پرداخت تأییدشده', en: 'Payment authorized', tone: 'success' },
  PaymentSettled: { fa: 'پرداخت‌شده، در حال آماده‌سازی', en: 'Paid · preparing', tone: 'success' },
  PartiallyShipped: { fa: 'بخشی از سفارش ارسال شد', en: 'Partially shipped', tone: 'warning' },
  Shipped: { fa: 'ارسال‌شده', en: 'Shipped', tone: 'success' },
  PartiallyDelivered: { fa: 'بخشی از سفارش تحویل شد', en: 'Partially delivered', tone: 'warning' },
  Delivered: { fa: 'تحویل‌داده‌شده', en: 'Delivered', tone: 'success' },
  Cancelled: { fa: 'لغوشده', en: 'Cancelled', tone: 'danger' },
  Modifying: { fa: 'در حال اصلاح سفارش', en: 'Being updated', tone: 'warning' },
  ArrangingAdditionalPayment: { fa: 'در انتظار پرداخت تکمیلی', en: 'Additional payment due', tone: 'warning' },
}

export function orderStatus(state: string, locale: string) {
  const status = statuses[state]
  return {
    label: status ? status[locale === 'fa' ? 'fa' : 'en'] : (locale === 'fa' ? 'در حال پردازش' : 'Processing'),
    tone: status?.tone ?? 'neutral',
  }
}

export function formatOrderDate(value: string | null, locale: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(date)
}
