import { defaultCollectionFilters, LanguageCode } from '@vendure/core';

type Translation = {
    description: string;
    args: Record<string, { label: string; description?: string }>;
};

const translations: Record<string, Translation> = {
    'facet-value-filter': {
        description: 'فیلتر بر اساس مقادیر ویژگی‌ها',
        args: {
            facetValueIds: { label: 'مقادیر ویژگی‌ها' },
            containsAny: {
                label: 'وجود حداقل یکی از مقادیر',
                description: 'اگر فعال باشد، وجود یکی از مقادیر کافی است؛ در غیر این صورت محصول باید همهٔ مقادیر انتخاب‌شده را داشته باشد.',
            },
            combineWithAnd: {
                label: 'نحوهٔ ترکیب فیلترها',
                description: 'اگر چند فیلتر دارید، مشخص کنید همهٔ شرط‌ها برقرار باشند (و) یا یکی از آن‌ها کافی باشد (یا).',
            },
        },
    },
    'variant-name-filter': {
        description: 'فیلتر بر اساس نام نوع محصول',
        args: {
            operator: { label: 'نوع تطبیق' },
            term: { label: 'عبارت مورد جستجو' },
            combineWithAnd: { label: 'نحوهٔ ترکیب فیلترها' },
        },
    },
    'variant-id-filter': {
        description: 'انتخاب دستی انواع محصول',
        args: {
            variantIds: { label: 'انواع محصول' },
            combineWithAnd: { label: 'نحوهٔ ترکیب فیلترها' },
        },
    },
    'product-id-filter': {
        description: 'انتخاب دستی محصولات',
        args: {
            productIds: { label: 'محصولات' },
            combineWithAnd: { label: 'نحوهٔ ترکیب فیلترها' },
        },
    },
};

type Localized = Array<{ languageCode: LanguageCode; value: string }>;
type TranslatableArg = {
    label?: Localized;
    description?: Localized;
    ui?: { options?: Array<{ value: string; label?: Localized }> };
};

function addPersian(values: Localized | undefined, value: string): Localized {
    return [...(values ?? []).filter(item => item.languageCode !== LanguageCode.fa), { languageCode: LanguageCode.fa, value }];
}

for (const filter of defaultCollectionFilters) {
    const translation = translations[filter.code];
    if (!translation) continue;
    filter.description.splice(0, filter.description.length, ...addPersian(filter.description, translation.description));
    for (const [name, translated] of Object.entries(translation.args)) {
        const arg = (filter.args as Record<string, TranslatableArg>)[name];
        if (!arg) continue;
        arg.label = addPersian(arg.label, translated.label);
        if (translated.description) arg.description = addPersian(arg.description, translated.description);
    }
}

// Keep the operator values unchanged: Vendure's filter logic depends on them.
const nameFilter = defaultCollectionFilters.find(filter => filter.code === 'variant-name-filter');
const operator = (nameFilter?.args as Record<string, TranslatableArg> | undefined)?.operator;
const operatorLabels: Record<string, string> = {
    startsWith: 'شروع شود با',
    endsWith: 'پایان یابد با',
    contains: 'شامل باشد',
    doesNotContain: 'شامل نباشد',
};
for (const option of operator?.ui?.options ?? []) {
    const label = operatorLabels[option.value];
    if (label) option.label = addPersian(option.label, label);
}
