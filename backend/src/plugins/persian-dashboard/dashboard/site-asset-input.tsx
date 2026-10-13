import { AssetPickerDialog, type DashboardFormComponent } from '@vendure/dashboard';
import { useState } from 'react';

export const SiteAssetInput: DashboardFormComponent = ({ value, onChange, onBlur, disabled, fieldDef }) => {
    const [pickerOpen, setPickerOpen] = useState(false);
    const [error, setError] = useState('');
    const imageUrl = typeof value === 'string' ? value : '';
    const isFavicon = fieldDef?.name === 'faviconUrl';
    const title = isFavicon ? 'آیکون سایت' : 'لوگوی سایت';

    return (
        <div className="space-y-3" dir="rtl">
            {imageUrl && (
                <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30 p-3">
                    <img src={imageUrl} alt={`پیش‌نمایش ${title}`} className="max-h-full max-w-full object-contain" />
                </div>
            )}
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setPickerOpen(true)}
                    className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:border-primary disabled:opacity-50"
                >
                    {imageUrl ? 'تغییر تصویر' : 'انتخاب یا بارگذاری تصویر'}
                </button>
                {imageUrl && (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => { onChange(''); onBlur(); setError(''); }}
                        className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-500 disabled:opacity-50"
                    >
                        حذف تصویر
                    </button>
                )}
            </div>
            <p className="text-xs text-muted-foreground">
                {isFavicon ? 'برای favicon تصویر مربعی، ترجیحاً PNG یا SVG، انتخاب کنید.' : 'لوگو را از فایل‌های موجود انتخاب کنید یا فایل جدید بارگذاری کنید.'}
            </p>
            {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
            <AssetPickerDialog
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                title={`انتخاب ${title}`}
                onSelect={assets => {
                    const asset = assets[0];
                    if (!asset) return;
                    if (asset.type !== 'IMAGE') {
                        setError('لطفاً فقط فایل تصویری انتخاب کنید.');
                        return;
                    }
                    onChange(asset.source);
                    onBlur();
                    setError('');
                }}
            />
        </div>
    );
};
