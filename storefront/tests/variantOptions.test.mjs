import assert from 'node:assert/strict'
import { test } from 'node:test'
import { chooseVariantOption, getOptionVariants, getVariantOptionGroups } from '../app/utils/variantOptions.ts'

const weight = { id: 'weight', code: 'weight', name: 'وزن', options: [
  { id: '250', code: '250g', name: '۲۵۰ گرم' },
  { id: '500', code: '500g', name: '۵۰۰ گرم' },
  { id: '1000', code: '1kg', name: '۱ کیلوگرم' },
] }
const preparation = { id: 'preparation', code: 'preparation', name: 'نوع', options: [
  { id: 'raw', code: 'raw', name: 'خام' },
  { id: 'roasted', code: 'roasted', name: 'بوداده' },
] }
const variants = preparation.options.flatMap(type => weight.options.map((size, index) => ({
  id: `${type.id}-${size.id}`,
  name: `بادام ${type.name} ${size.name}`,
  options: [{ id: type.id }, { id: size.id }],
  stockLevel: 'IN_STOCK',
  priceWithTax: (index + 1) * (type.id === 'raw' ? 100 : 150),
  currencyCode: 'IRR',
})))
const groups = getVariantOptionGroups([weight, preparation], variants)

test('shows type before weight and uses concise option labels', () => {
  assert.deepEqual(groups.map(group => group.id), ['preparation', 'weight'])
  assert.deepEqual(groups[0].options.map(option => option.name), ['خام', 'بوداده'])
})

test('sorts mixed Persian, Arabic and English weights in grams without changing source data', () => {
  const options = [
    { id: 'quarter', code: 'quarter', name: '۲۵۰ گرمی' },
    { id: 'half', code: 'half', name: '٥٠٠ گرمی' },
    { id: 'kilo', code: 'kilo', name: '۱ کیلو گرم' },
    { id: 'hundred', code: 'hundred', name: '100 گرمی' },
    { id: 'small', code: 'small', name: '۰٫۰۵ کیلوگرم' },
    { id: 'one-and-half', code: 'one-and-half', name: '۱٬۵۰۰ گرم' },
    { id: 'large', code: '2kg', name: 'بسته بزرگ' },
    { id: 'custom', code: 'custom', name: 'سفارشی' },
    { id: 'other', code: 'other', name: 'سایر' },
  ]
  const group = { ...weight, options }
  const originalOrder = options.map(option => option.id)
  const values = options.map(option => ({ ...variants[0], id: option.id, options: [{ id: option.id }] }))
  const sorted = getVariantOptionGroups([group], values)[0].options.map(option => option.id)
  assert.deepEqual(sorted, ['small', 'hundred', 'quarter', 'half', 'kilo', 'one-and-half', 'large', 'custom', 'other'])
  assert.deepEqual(group.options.map(option => option.id), originalOrder)
})

test('keeps equal weights stable and does not sort other option groups', () => {
  const options = [
    { id: 'a', code: '500gr', name: '500 gr' },
    { id: 'b', code: 'half-kg', name: '0.5 kg' },
    { id: 'c', code: '100g', name: '100 g' },
  ]
  const values = options.map(option => ({ ...variants[0], id: option.id, options: [{ id: option.id }] }))
  assert.deepEqual(getVariantOptionGroups([{ ...weight, options }], values)[0].options.map(option => option.id), ['c', 'a', 'b'])
  assert.deepEqual(getVariantOptionGroups([{ ...preparation, options }], values)[0].options.map(option => option.id), ['a', 'b', 'c'])
})

test('changing preparation preserves weight and picks the exact price and cart variant', () => {
  const raw500 = variants.find(variant => variant.id === 'raw-500')
  const selected = chooseVariantOption(variants, groups, raw500, 0, 'roasted')
  assert.equal(selected, variants.find(variant => variant.id === 'roasted-500'))
  assert.equal(selected.priceWithTax, 300)
  assert.equal(chooseVariantOption(variants, groups, selected, 1, '1000').id, 'roasted-1000')
})

test('missing combinations cannot select a variant of the wrong preparation', () => {
  const limited = variants.filter(variant => variant.id !== 'roasted-1000')
  const roasted = limited.find(variant => variant.id === 'roasted-500')
  assert.deepEqual(getOptionVariants(limited, groups, roasted, 1, '1000'), [])
  assert.equal(chooseVariantOption(limited, groups, roasted, 1, '1000'), undefined)
  const raw = limited.find(variant => variant.id === 'raw-1000')
  assert.equal(chooseVariantOption(limited, groups, raw, 0, 'roasted').id, 'roasted-250')
})

test('preserves a sold-out matching weight so its real availability is displayed', () => {
  const soldOut = variants.map(variant => variant.id === 'roasted-500' ? { ...variant, stockLevel: 'OUT_OF_STOCK' } : variant)
  const selected = chooseVariantOption(soldOut, groups, soldOut.find(variant => variant.id === 'raw-500'), 0, 'roasted')
  assert.equal(selected.id, 'roasted-500')
  assert.equal(selected.stockLevel, 'OUT_OF_STOCK')
})

test('uses an in-stock alternative when the old weight does not exist for the new type', () => {
  const limited = variants.filter(variant => variant.id !== 'roasted-1000')
    .map(variant => variant.id === 'roasted-250' ? { ...variant, stockLevel: 'OUT_OF_STOCK' } : variant)
  assert.equal(chooseVariantOption(limited, groups, limited.find(variant => variant.id === 'raw-1000'), 0, 'roasted').id, 'roasted-500')
})

test('supports weight-only products and falls back for legacy/incomplete data', () => {
  const weightsOnly = variants.filter(variant => variant.id.startsWith('raw-'))
    .map(variant => ({ ...variant, options: variant.options.filter(option => option.id !== 'raw') }))
  assert.equal(getVariantOptionGroups([weight], weightsOnly).length, 1)
  assert.deepEqual(getVariantOptionGroups([], weightsOnly), [])
  assert.deepEqual(getVariantOptionGroups([weight, preparation], weightsOnly), groups.filter(group => group.id === 'weight'))
  assert.deepEqual(getVariantOptionGroups([weight], [{ ...weightsOnly[0], options: [] }, weightsOnly[1]]), [])
  assert.deepEqual(getVariantOptionGroups([weight], []), [])
})
