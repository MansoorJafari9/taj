import { AffixedInput } from '@/vdb/components/data-input/affixed-input.js';
import type { DashboardFormComponentProps } from '@/vdb/framework/form-engine/form-engine-types.js';
import { isFieldDisabled } from '@/vdb/framework/form-engine/utils.js';
import { useChannel } from '@/vdb/hooks/use-channel.js';
import { useDisplayLocale } from '@/vdb/hooks/use-display-locale.js';
import { useLocalFormat } from '@/vdb/hooks/use-local-format.js';
import { useEffect, useMemo, useRef, useState } from 'react';

interface MoneyInputProps extends DashboardFormComponentProps {
    currency?: string;
}

/** Vendure MoneyInput with whole-number editing for IRR/IRT only. */
export function MoneyInput(props: Readonly<MoneyInputProps>) {
    const { value, onChange, currency, ...rest } = props;
    const { activeChannel } = useChannel();
    const activeCurrency = currency ?? activeChannel?.defaultCurrencyCode;
    const wholeToman = activeCurrency === 'IRR' || activeCurrency === 'IRT';
    const fractionDigits = wholeToman ? 0 : 2;
    const { bcp47Tag } = useDisplayLocale();
    const { toMajorUnits, toMinorUnits } = useLocalFormat();
    const [displayValue, setDisplayValue] = useState(() => toMajorUnits(value).toFixed(fractionDigits));
    const isFocused = useRef(false);

    useEffect(() => {
        if (!isFocused.current) {
            setDisplayValue(toMajorUnits(value).toFixed(fractionDigits));
        }
    }, [value, toMajorUnits, fractionDigits]);

    const { currencySymbol, shouldPrefix } = useMemo(() => {
        if (!activeCurrency) return { currencySymbol: '', shouldPrefix: false };
        const formatter = new Intl.NumberFormat(bcp47Tag, {
            style: 'currency',
            currency: activeCurrency,
            currencyDisplay: 'symbol',
        });
        const parts = formatter.formatToParts(Number.NaN);
        const symbol = parts.find(part => part.type === 'currency')?.value ?? activeCurrency;
        const numberIndex = parts.findIndex(part => part.type === 'nan');
        const currencyIndex = parts.findIndex(part => part.type === 'currency');
        return { currencySymbol: symbol, shouldPrefix: currencyIndex < numberIndex };
    }, [activeCurrency, bcp47Tag]);

    return (
        <AffixedInput
            type="text"
            className="bg-background"
            value={displayValue}
            disabled={isFieldDisabled(props.disabled, props.fieldDef)}
            {...rest}
            inputMode={wholeToman ? 'numeric' : 'decimal'}
            onFocus={() => { isFocused.current = true; }}
            onChange={event => {
                const input = event.target.value;
                if (input === '') {
                    setDisplayValue('');
                    onChange(0);
                    return;
                }
                if (!(wholeToman ? /^\d+$/ : /^\d*\.?\d*$/).test(input)) return;
                setDisplayValue(input);
                const amount = Number(input);
                if (Number.isFinite(amount)) onChange(toMinorUnits(amount));
            }}
            onKeyDown={event => {
                if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
                event.preventDefault();
                const step = wholeToman ? 1 : 0.01;
                const amount = (Number(displayValue) || 0) + (event.key === 'ArrowUp' ? step : -step);
                if (amount >= 0) {
                    onChange(toMinorUnits(amount));
                    setDisplayValue(amount.toFixed(fractionDigits));
                }
            }}
            onBlur={() => {
                isFocused.current = false;
                const amount = Number(displayValue) || 0;
                onChange(toMinorUnits(amount));
                setDisplayValue(amount.toFixed(fractionDigits));
            }}
            step={wholeToman ? '1' : '0.01'}
            min="0"
            prefix={shouldPrefix ? currencySymbol : undefined}
            suffix={!shouldPrefix ? currencySymbol : undefined}
        />
    );
}
