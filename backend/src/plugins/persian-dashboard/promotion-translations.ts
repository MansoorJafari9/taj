import { defaultPromotionActions, defaultPromotionConditions, LanguageCode } from '@vendure/core';

// Vendure's built-in promotion definitions ship with English descriptions. The
// dashboard reads these from Admin API, so translating the definitions also
// translates the condition/action picker without patching dashboard internals.
const conditions: Record<string, { description: string; args?: Record<string, string> }> = {
    minimum_order_amount: { description: 'اگر مبلغ سفارش بیشتر از { amount } باشد', args: { amount: 'حداقل مبلغ سفارش', taxInclusive: 'مبلغ با احتساب مالیات' } },
    at_least_n_with_facets: { description: 'خرید دست‌کم { minimum } محصول با ویژگی‌های مشخص', args: { minimum: 'حداقل تعداد', facets: 'مقادیر ویژگی‌ها' } },
    contains_products: { description: 'خرید دست‌کم { minimum } عدد از محصولات مشخص', args: { minimum: 'حداقل تعداد', productVariantIds: 'انواع محصول' } },
    customer_group: { description: 'مشتری عضو گروه مشخص باشد', args: { customerGroupId: 'گروه مشتریان' } },
    buy_x_get_y_free: { description: 'خرید X محصول و دریافت Y محصول رایگان', args: { amountX: 'تعداد خرید', variantIdsX: 'انواع محصول برای خرید', amountY: 'تعداد رایگان', variantIdsY: 'انواع محصول رایگان' } },
};

const actions: Record<string, { description: string; args?: Record<string, string> }> = {
    order_fixed_discount: { description: 'کسر مبلغ ثابت از سفارش', args: { discount: 'مبلغ تخفیف' } },
    order_line_fixed_discount: { description: 'کسر مبلغ ثابت از هر ردیف سفارش', args: { discount: 'مبلغ تخفیف' } },
    order_percentage_discount: { description: 'تخفیف { discount } درصدی روی سفارش', args: { discount: 'درصد تخفیف' } },
    facet_based_discount: { description: 'تخفیف { discount } درصدی روی محصولات دارای ویژگی‌های مشخص', args: { discount: 'درصد تخفیف', facets: 'مقادیر ویژگی‌ها' } },
    products_percentage_discount: { description: 'تخفیف { discount } درصدی روی محصولات مشخص', args: { discount: 'درصد تخفیف', productVariantIds: 'انواع محصول' } },
    free_shipping: { description: 'ارسال رایگان' },
    buy_x_get_y_free: { description: 'خرید X محصول و دریافت Y محصول رایگان' },
};

for (const [definitions, translations] of [
    [defaultPromotionConditions, conditions],
    [defaultPromotionActions, actions],
] as const) {
    for (const definition of definitions) {
        const translation = translations[definition.code];
        if (!translation) continue;
        definition.description.push({ languageCode: LanguageCode.fa, value: translation.description });
        for (const [name, label] of Object.entries(translation.args ?? {})) {
            const arg = (definition.args as Record<string, { label?: Array<{ languageCode: LanguageCode; value: string }> }>)[name];
            if (arg) arg.label = [...(arg.label ?? []), { languageCode: LanguageCode.fa, value: label }];
        }
    }
}
