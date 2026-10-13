// Only change Dashboard formatting. Vendure amounts still use its configured
// money-strategy precision, and this must not alter stored prices or payments.
// IRT is included for display compatibility with existing data, although it is
// not a supported Vendure CurrencyCode and should not be used for a Channel.
const patchKey = Symbol.for('myshop.dashboard.toman-currency-display.v2');
const isTomanCode = code => typeof code === 'string' && ['IRR', 'IRT'].includes(code.toUpperCase());

if (!globalThis[patchKey]) {
    const OriginalNumberFormat = Intl.NumberFormat;
    const OriginalDisplayNames = Intl.DisplayNames;

    const withTomanLabel = parts =>
        parts.map(part => (part.type === 'currency' ? { ...part, value: 'تومان' } : part));

    function patchNumberFormatter(formatter) {
        const formatToParts = formatter.formatToParts.bind(formatter);
        const tomanParts = value => withTomanLabel(formatToParts(value));

        Object.defineProperties(formatter, {
            formatToParts: { configurable: true, value: tomanParts },
            format: {
                configurable: true,
                value: value => tomanParts(value).map(part => part.value).join(''),
            },
        });

        if (typeof formatter.formatRangeToParts === 'function') {
            const formatRangeToParts = formatter.formatRangeToParts.bind(formatter);
            const tomanRangeParts = (start, end) => withTomanLabel(formatRangeToParts(start, end));
            Object.defineProperties(formatter, {
                formatRangeToParts: { configurable: true, value: tomanRangeParts },
                formatRange: {
                    configurable: true,
                    value: (start, end) => tomanRangeParts(start, end).map(part => part.value).join(''),
                },
            });
        }

        return formatter;
    }

    Intl.NumberFormat = new Proxy(OriginalNumberFormat, {
        construct(Target, args, newTarget) {
            const options = args[1];
            if (options?.style !== 'currency' || !isTomanCode(options.currency)) {
                return Reflect.construct(Target, args, newTarget);
            }
            const wholeTomanOptions = { ...options, minimumFractionDigits: 0, maximumFractionDigits: 0 };
            return patchNumberFormatter(Reflect.construct(Target, [args[0], wholeTomanOptions], newTarget));
        },
        apply(Target, thisArg, args) {
            const options = args[1];
            if (options?.style !== 'currency' || !isTomanCode(options.currency)) {
                return Reflect.apply(Target, thisArg, args);
            }
            const wholeTomanOptions = { ...options, minimumFractionDigits: 0, maximumFractionDigits: 0 };
            return patchNumberFormatter(Reflect.apply(Target, thisArg, [args[0], wholeTomanOptions]));
        },
    });

    Intl.DisplayNames = new Proxy(OriginalDisplayNames, {
        construct(Target, args, newTarget) {
            const displayNames = Reflect.construct(Target, args, newTarget);
            if (args[1]?.type === 'currency') {
                const originalOf = displayNames.of.bind(displayNames);
                Object.defineProperty(displayNames, 'of', {
                    configurable: true,
                    value: code => (isTomanCode(code)
                        ? 'تومان'
                        : originalOf(code)),
                });
            }
            return displayNames;
        },
    });

    globalThis[patchKey] = true;
}
