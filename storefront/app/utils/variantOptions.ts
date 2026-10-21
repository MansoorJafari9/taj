import type { ProductOption, ProductOptionGroup, ProductVariantDetail } from '~/types/product'

function isWeightGroup(group: ProductOptionGroup): boolean {
  return /weight|وزن/i.test(`${group.code} ${group.name}`)
}

function weightInGrams(option: ProductOption): number {
  for (const value of [option.name, option.code]) {
    const normalized = value
      .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x06F0))
      .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x0660))
      .replace(/٫/g, '.')
      .replace(/[,٬]/g, '')
      .replace(/[\s\u200c\u200d]/g, '')
      .toLowerCase()
    const match = normalized.match(/(\d+(?:\.\d+)?)(کیلو(?:گرم)?ی?|kilograms?|kilos?|kgs?|گرمی?|grams?|gr|g)(?![a-z])/)
    if (match) {
      const amount = Number(match[1])
      const kilograms = /^(کیلو|k)/.test(match[2]!)
      return amount * (kilograms ? 1000 : 1)
    }
  }
  // Leave unrecognized labels at the end in their original order.
  return Number.POSITIVE_INFINITY
}

export function getVariantOptionGroups(groups: ProductOptionGroup[], variants: ProductVariantDetail[]): ProductOptionGroup[] {
  if (!variants.length) return []
  const usedIds = new Set(variants.flatMap(variant => variant.options.map(option => option.id)))
  const populatedGroups = groups
    .map(group => ({ ...group, options: group.options.filter(option => usedIds.has(option.id)) }))
    .filter(group => group.options.length)

  // Keep the flat selector for legacy variants that do not have complete option data.
  if (variants.some(variant => populatedGroups.some(group =>
    !group.options.some(option => variant.options.some(value => value.id === option.id)),
  ))) return []

  // Product type/preparation should precede weight, regardless of dashboard group order.
  return populatedGroups
    .map(group => isWeightGroup(group) ? {
      ...group,
      options: group.options.sort((a, b) => {
        const left = weightInGrams(a)
        const right = weightInGrams(b)
        return left === right ? 0 : left - right
      }),
    } : group)
    .sort((a, b) => Number(isWeightGroup(a)) - Number(isWeightGroup(b)))
}

export function getOptionVariants(
  variants: ProductVariantDetail[],
  groups: ProductOptionGroup[],
  selected: ProductVariantDetail | undefined,
  groupIndex: number,
  optionId: string,
): ProductVariantDetail[] {
  return variants.filter(variant => {
    if (!variant.options.some(option => option.id === optionId)) return false
    return groups.slice(0, groupIndex).every(group => {
      const chosen = selected?.options.find(option => group.options.some(value => value.id === option.id))
      return chosen && variant.options.some(option => option.id === chosen.id)
    })
  })
}

export function chooseVariantOption(
  variants: ProductVariantDetail[],
  groups: ProductOptionGroup[],
  selected: ProductVariantDetail | undefined,
  groupIndex: number,
  optionId: string,
): ProductVariantDetail | undefined {
  const candidates = getOptionVariants(variants, groups, selected, groupIndex, optionId)
  // Preserve later selections (such as weight) when changing an earlier group.
  const laterOptionIds = groups.slice(groupIndex + 1).flatMap(group =>
    selected?.options.filter(option => group.options.some(value => value.id === option.id)).map(option => option.id) ?? [],
  )
  return candidates.find(variant => laterOptionIds.every(id => variant.options.some(option => option.id === id)))
    ?? candidates.find(variant => variant.stockLevel !== 'OUT_OF_STOCK')
    ?? candidates[0]
}
