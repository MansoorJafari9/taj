/** Normalize Persian/Arabic digits and common Iranian mobile prefixes. */
export function normalizeIranMobile(value: string): string | null {
  const digits = value
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632))
    .replace(/[\s()-]/g, '')
  const mobile = digits.replace(/^(?:\+98|0098|98)(?=9)/, '0')
  return /^09\d{9}$/.test(mobile) ? mobile : null
}
