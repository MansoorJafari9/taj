/// <reference types="vite/client" />
import { api, defineDashboardExtension, RichTextEditor } from '@vendure/dashboard';
import { AssetPickerDialog } from '@/vdb/components/shared/asset/asset-picker-dialog.js';
import { useCallback, useEffect, useState, type FormEvent } from 'react';

type Article = {
    id: string;
    slug: string;
    languageCode: 'fa' | 'en';
    title: string;
    excerpt: string;
    body: string;
    coverImageUrl: string | null;
    category: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    published: boolean;
    productIds: string[];
    publishedAt: string | null;
    updatedAt: string;
};

type ArticleInput = Omit<Article, 'id' | 'publishedAt' | 'updatedAt'>;

const emptyArticle: ArticleInput = {
    slug: '', languageCode: 'fa', title: '', excerpt: '', body: '', coverImageUrl: '',
    category: '', seoTitle: '', seoDescription: '', published: false, productIds: [],
};

const LIST = `query BlogAdminList($options: BlogPostListOptions) {
  blogPosts(options: $options) { totalItems items {
    id slug languageCode title excerpt body coverImageUrl category seoTitle seoDescription published publishedAt updatedAt productIds
  } }
}`;
const CREATE = `mutation CreateBlogPost($input: BlogPostInput!) { createBlogPost(input: $input) { id } }`;
const UPDATE = `mutation UpdateBlogPost($id: ID!, $input: BlogPostInput!) { updateBlogPost(id: $id, input: $input) { id } }`;
const DELETE = `mutation DeleteBlogPost($id: ID!) { deleteBlogPost(id: $id) }`;
const PRODUCTS = `query BlogProducts($options: ProductListOptions) { products(options: $options) { items { id name slug } } }`;
type ProductOption = { id: string; name: string; slug: string };

const inputClass = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary';
const labelClass = 'grid gap-1 text-sm font-medium';
const storefrontUrl = (import.meta.env.VITE_STOREFRONT_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '')).replace(/\/$/, '');

function BlogDashboard() {
    const [screen, setScreen] = useState<'list' | 'editor'>('list');
    const [items, setItems] = useState<Article[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ArticleInput>(emptyArticle);
    const [assetPickerOpen, setAssetPickerOpen] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [productResults, setProductResults] = useState<ProductOption[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<ProductOption[]>([]);
    const [searchingProducts, setSearchingProducts] = useState(false);
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.query<{ blogPosts: { items: Article[]; totalItems: number } }>(LIST, {
                options: { skip: page * 20, take: 20 },
            });
            setItems(data.blogPosts.items);
            setTotal(data.blogPosts.totalItems);
            setError('');
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'بارگذاری مقاله‌ها ناموفق بود.');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { void load(); }, [load]);

    useEffect(() => {
        if (screen !== 'editor' || !productSearch.trim()) {
            setProductResults([]);
            return;
        }
        let active = true;
        const timer = window.setTimeout(async () => {
            setSearchingProducts(true);
            try {
                const data = await api.query<{ products: { items: ProductOption[] } }>(PRODUCTS, {
                    options: { take: 12, filter: { name: { contains: productSearch.trim() } } },
                });
                if (active) setProductResults(data.products.items);
            } catch (cause) {
                if (active) setError(cause instanceof Error ? cause.message : 'جست‌وجوی محصول ناموفق بود.');
            } finally {
                if (active) setSearchingProducts(false);
            }
        }, 300);
        return () => { active = false; window.clearTimeout(timer); };
    }, [screen, productSearch]);

    function startEdit(post: Article) {
        setScreen('editor');
        setEditingId(post.id);
        setForm({
            slug: post.slug, languageCode: post.languageCode, title: post.title,
            excerpt: post.excerpt, body: post.body, coverImageUrl: post.coverImageUrl ?? '',
            category: post.category ?? '', seoTitle: post.seoTitle ?? '',
            seoDescription: post.seoDescription ?? '', published: post.published,
            productIds: post.productIds ?? [],
        });
        setSelectedProducts([]);
        setProductSearch('');
        setAssetPickerOpen(false);
        if (post.productIds?.length) {
            void api.query<{ products: { items: ProductOption[] } }>(PRODUCTS, {
                options: { take: 12, filter: { id: { in: post.productIds } } },
            }).then(data => setSelectedProducts(data.products.items)).catch(cause =>
                setError(cause instanceof Error ? cause.message : 'نام محصولات پیوست‌شده بارگذاری نشد.'));
        }
        setNotice('');
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function startNew() {
        setScreen('editor');
        setEditingId(null);
        setForm({ ...emptyArticle });
        setSelectedProducts([]);
        setProductSearch('');
        setAssetPickerOpen(false);
        setNotice('');
        setError('');
    }

    async function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true);
        setError('');
        setNotice('');
        try {
            if (editingId) await api.mutate(UPDATE, { id: editingId, input: form });
            else await api.mutate(CREATE, { input: form });
            setEditingId(null);
            setForm({ ...emptyArticle });
            setScreen('list');
            setNotice('مقاله ذخیره شد.');
            await load();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'ذخیره مقاله ناموفق بود.');
        } finally {
            setBusy(false);
        }
    }

    async function remove(post: Article) {
        if (!window.confirm(`مقاله «${post.title}» حذف شود؟`)) return;
        setBusy(true);
        setError('');
        try {
            await api.mutate(DELETE, { id: post.id });
            if (editingId === post.id) {
                setEditingId(null);
                setScreen('list');
            }
            if (items.length === 1 && page > 0) setPage(page - 1);
            else await load();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'حذف مقاله ناموفق بود.');
        } finally {
            setBusy(false);
        }
    }

    return <div className="mx-auto max-w-6xl space-y-8 p-6" dir="rtl">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h1 className="text-2xl font-bold">{screen === 'list' ? 'مقالات بلاگ' : editingId ? 'ویرایش مقاله' : 'مقاله جدید'}</h1><p className="mt-1 text-sm text-muted-foreground">{screen === 'list' ? `${total} مقاله ثبت شده است` : 'پس از ذخیره به فهرست مقاله‌ها برمی‌گردید.'}</p></div>
            {screen === 'list'
                ? <button type="button" onClick={startNew} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">+ مقاله جدید</button>
                : <button type="button" onClick={() => setScreen('list')} className="rounded-lg border border-border px-4 py-2">بازگشت به فهرست</button>}
        </div>
        {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
        {notice && <p role="status" className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600">{notice}</p>}

        {screen === 'editor' && <form onSubmit={save} className="space-y-5 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">{editingId ? 'ویرایش مقاله' : 'مقاله جدید'}</h2>
            <div className="grid gap-4 md:grid-cols-2">
                <label className={labelClass}>عنوان مقاله<input required maxLength={255} className={inputClass} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
                <label className={labelClass}>آدرس کوتاه لاتین (slug)<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" className={inputClass} dir="ltr" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase() })} placeholder="how-to-store-nuts" /></label>
                <label className={labelClass}>زبان<select className={inputClass} value={form.languageCode} onChange={e => setForm({ ...form, languageCode: e.target.value as ArticleInput['languageCode'] })}><option value="fa">فارسی</option><option value="en">English</option></select></label>
                <label className={labelClass}>دستهٔ مقاله<input className={inputClass} value={form.category ?? ''} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="راهنمای خرید" /></label>
            </div>
            <label className={labelClass}>خلاصهٔ مقاله<textarea required rows={3} className={inputClass} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} /></label>
            <div className={labelClass}><span>متن مقاله</span><div className="min-h-64 rounded-lg border border-border bg-background p-3"><RichTextEditor value={form.body} onChange={body => setForm(previous => ({ ...previous, body }))} placeholder="متن مقاله را بنویسید…" /></div></div>
            <div className="space-y-3">
                <span className="text-sm font-medium">تصویر شاخص مقاله</span>
                {form.coverImageUrl && <img src={form.coverImageUrl} alt="پیش‌نمایش تصویر شاخص" className="h-44 max-w-full rounded-xl border border-border object-cover" />}
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setAssetPickerOpen(true)} className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:border-primary">{form.coverImageUrl ? 'تغییر تصویر' : 'انتخاب یا بارگذاری تصویر'}</button>
                    {form.coverImageUrl && <button type="button" onClick={() => setForm(previous => ({ ...previous, coverImageUrl: '' }))} className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-500">حذف تصویر</button>}
                </div>
                <p className="text-xs text-muted-foreground">از فایل‌های موجود انتخاب کنید یا تصویر جدیدی در کتابخانهٔ فایل‌ها بارگذاری کنید.</p>
                <AssetPickerDialog
                    open={assetPickerOpen}
                    onClose={() => setAssetPickerOpen(false)}
                    title="انتخاب تصویر شاخص مقاله"
                    onSelect={assets => {
                        const asset = assets[0];
                        if (!asset) return;
                        if (asset.type !== 'IMAGE') {
                            setError('برای تصویر شاخص، فقط فایل تصویری انتخاب کنید.');
                            return;
                        }
                        setForm(previous => ({ ...previous, coverImageUrl: asset.source }));
                        setError('');
                    }}
                />
            </div>
            <div className="space-y-3 rounded-xl border border-border bg-background p-4">
                <div><h3 className="font-bold">محصولات مرتبط با مقاله</h3><p className="mt-1 text-xs text-muted-foreground">این محصولات بعد از متن مقاله نمایش داده می‌شوند و خواننده می‌تواند وارد صفحهٔ خریدشان شود. حداکثر ۱۲ محصول.</p></div>
                <label className={labelClass}>جست‌وجوی محصول<input className={inputClass} value={productSearch} onChange={e => { setProductSearch(e.target.value); setProductResults([]); }} placeholder="نام محصول را بنویسید…" /></label>
                {form.productIds.length > 0 && <div className="flex flex-wrap gap-2">{form.productIds.map(id => {
                    const product = selectedProducts.find(item => item.id === id);
                    return <button key={id} type="button" onClick={() => { setForm(previous => ({ ...previous, productIds: previous.productIds.filter(value => value !== id) })); setSelectedProducts(previous => previous.filter(item => item.id !== id)); }} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm text-primary" title="حذف محصول از مقاله">{product?.name || `محصول ${id}`} ×</button>;
                })}</div>}
                {searchingProducts && <p className="text-sm text-muted-foreground">در حال جست‌وجو…</p>}
                {productSearch.trim() && !searchingProducts && <div className="grid max-h-52 gap-1 overflow-y-auto">{productResults.length ? productResults.map(product => <button key={product.id} type="button" disabled={form.productIds.includes(product.id) || form.productIds.length >= 12} onClick={() => { setForm(previous => ({ ...previous, productIds: [...previous.productIds, product.id] })); setSelectedProducts(previous => [...previous.filter(item => item.id !== product.id), product]); }} className="flex items-center justify-between rounded-lg px-3 py-2 text-start text-sm hover:bg-muted disabled:opacity-50"><span>{product.name}</span><span>{form.productIds.includes(product.id) ? 'انتخاب‌شده' : 'افزودن +'}</span></button>) : <p className="text-sm text-muted-foreground">محصولی پیدا نشد.</p>}</div>}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <label className={labelClass}>عنوان سئو<input maxLength={255} className={inputClass} value={form.seoTitle ?? ''} onChange={e => setForm({ ...form, seoTitle: e.target.value })} /></label>
                <label className={labelClass}>توضیح سئو<textarea rows={2} maxLength={320} className={inputClass} value={form.seoDescription ?? ''} onChange={e => setForm({ ...form, seoDescription: e.target.value })} /></label>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />منتشر شود</label>
            <div className="flex gap-3"><button disabled={busy} type="submit" className="rounded-lg bg-primary px-5 py-2 text-primary-foreground disabled:opacity-50">{busy ? 'در حال ذخیره…' : 'ذخیره مقاله'}</button><button type="button" onClick={() => setScreen('list')} className="rounded-lg border border-border px-5 py-2">انصراف</button></div>
        </form>}

        {screen === 'list' && <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-bold">فهرست مقاله‌ها</h2><button type="button" onClick={() => void load()} className="text-sm font-semibold text-primary hover:underline">بارگذاری دوباره</button></div>
            {loading ? <p>در حال بارگذاری…</p> : !items.length ? <p className="text-muted-foreground">هنوز مقاله‌ای ثبت نشده است.</p> : <div className="space-y-2">
                {items.map(post => <div key={post.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                    <div><p className="font-semibold">{post.title}</p><p className="mt-1 text-xs text-muted-foreground">{post.languageCode === 'fa' ? 'فارسی' : 'English'} · {post.category || 'بدون دسته'} · {post.published ? 'منتشرشده' : 'پیش‌نویس'} · {post.productIds?.length ?? 0} محصول</p><p className="mt-1 text-xs text-muted-foreground" dir="ltr">/{post.languageCode}/blog/{post.slug}</p></div>
                    <div className="flex gap-2"><button type="button" onClick={() => startEdit(post)} className="rounded-lg border border-border px-3 py-1.5 text-sm">ویرایش</button>{post.published && storefrontUrl && <a href={`${storefrontUrl}/${post.languageCode}/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border px-3 py-1.5 text-sm">نمایش</a>}<button type="button" disabled={busy} onClick={() => void remove(post)} className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-500">حذف</button></div>
                </div>)}
            </div>}
            {total > 20 && <div className="mt-4 flex items-center gap-3 text-sm"><button disabled={page === 0} onClick={() => setPage(page - 1)}>قبلی</button><span>صفحه {page + 1}</span><button disabled={(page + 1) * 20 >= total} onClick={() => setPage(page + 1)}>بعدی</button></div>}
        </section>}
    </div>;
}

defineDashboardExtension({
    navSections: config => ({
        ...config,
        sections: config.sections.map(section => section.id === 'marketing' && 'items' in section
            ? { ...section, items: [...(section.items ?? []).filter(item => item.id !== 'blog-posts'), { id: 'blog-posts', title: 'مقالات بلاگ', url: '/blog', order: 200 }] }
            : section),
    }),
    routes: [{
        path: '/blog',
        component: () => <BlogDashboard />,
    }],
});
