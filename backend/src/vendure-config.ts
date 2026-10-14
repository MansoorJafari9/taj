import {
    DefaultGuestCheckoutStrategy,
    DefaultJobQueuePlugin,
    DefaultSchedulerPlugin,
    DefaultSearchPlugin,
    LanguageCode,
    VendureConfig,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { DashboardPlugin } from '@vendure/dashboard/plugin';
import { GraphiqlPlugin } from '@vendure/graphiql-plugin';
import { PersianDashboardPlugin } from './plugins/persian-dashboard/persian-dashboard.plugin';
import './plugins/persian-dashboard/promotion-translations';
import './plugins/persian-dashboard/collection-filter-translations';
import { CatalogSalePlugin } from './plugins/catalog-sale/catalog-sale.plugin';
import { BlogPlugin } from './plugins/blog/blog.plugin';
import { ZarinpalPlugin, zarinpalPaymentHandler } from './plugins/zarinpal/zarinpal.plugin';
import { config as loadEnv } from 'dotenv';
import path from 'path';
import { OwnerOnlyOrderByCodeAccessStrategy, SixDigitOrderCodeStrategy } from './order-code.strategy';

// The backend lives in a subdirectory while the shared project environment file
// remains at the repository root. This path works from both src/ in development
// and dist/ in production builds.
loadEnv({ path: path.join(__dirname, '../../.env') });

const IS_DEV = process.env.APP_ENV === 'dev';
// PORT wins because hosting platforms inject it into the environment at runtime, and that
// must take precedence over any value baked into the .env file at scaffold time.
const serverPort = +process.env.PORT || +process.env.VENDURE_SERVER_PORT || 3000;

export const config: VendureConfig = {
    // This value is used when Vendure creates the default Channel and global settings.
    // Existing installations must update these values once in Dashboard > Settings > Global settings.
    defaultLanguageCode: LanguageCode.fa,
    apiOptions: {
        port: serverPort,
        csrfPrevention: true,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        trustProxy: IS_DEV ? false : 1,
        // Which browser origins may make credentialed requests to the Shop and Admin APIs.
        // In dev any origin is reflected, so a storefront on any port works. In production set
        // CORS_ORIGINS to a comma-separated list of the origins you serve, for example
        // "https://example.com,https://admin.example.com". An unset value blocks all
        // cross-origin browser requests, which is the safe default.
        cors: {
            origin: IS_DEV ? true : (process.env.CORS_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) ?? []),
            credentials: true,
        },
        // The following options are useful in development mode,
        // but are best turned off for production for security
        // reasons.
        ...(IS_DEV ? {
            adminApiDebug: true,
            shopApiDebug: true,
        } : {}),
    },
    authOptions: {
        requireVerification: false,
        tokenMethod: ['bearer', 'cookie'],
        superadminCredentials: {
            identifier: process.env.SUPERADMIN_USERNAME,
            password: process.env.SUPERADMIN_PASSWORD,
        },
        cookieOptions: {
          secret: process.env.COOKIE_SECRET,
        },
    },
    dbConnectionOptions: {
        type: 'postgres',
        // See the README.md "Migrations" section for an explanation of
        // the `synchronize` and `migrations` options.
        synchronize: false,
        migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
        logging: false,
        database: process.env.DB_NAME,
        schema: process.env.DB_SCHEMA,
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    },
    paymentOptions: {
        paymentMethodHandlers: [zarinpalPaymentHandler],
    },
    orderOptions: {
        orderCodeStrategy: new SixDigitOrderCodeStrategy(),
        orderByCodeAccessStrategy: new OwnerOnlyOrderByCodeAccessStrategy(),
        guestCheckoutStrategy: new DefaultGuestCheckoutStrategy({
            allowGuestCheckouts: false,
            allowGuestCheckoutForRegisteredCustomers: false,
        }),
    },
    // When adding or altering custom field definitions, the database will
    // need to be updated. See the "Migrations" section in README.md.
    customFields: {
        Channel: [
            { name: 'siteName', type: 'string', label: [{ languageCode: LanguageCode.fa, value: 'نام سایت' }] },
            { name: 'siteLogoUrl', type: 'string', label: [{ languageCode: LanguageCode.fa, value: 'لوگوی سایت' }], ui: { component: 'site-image-picker' } },
            { name: 'faviconUrl', type: 'string', label: [{ languageCode: LanguageCode.fa, value: 'آیکون سایت (favicon)' }], ui: { component: 'site-image-picker' } },
            { name: 'aboutContent', type: 'text', label: [{ languageCode: LanguageCode.fa, value: 'محتوای صفحه درباره ما' }], ui: { component: 'rich-text-form-input' } },
            { name: 'contactContent', type: 'text', label: [{ languageCode: LanguageCode.fa, value: 'محتوای صفحه تماس با ما' }], ui: { component: 'rich-text-form-input' } },
            { name: 'contactEmail', type: 'string', label: [{ languageCode: LanguageCode.fa, value: 'ایمیل تماس' }] },
            { name: 'contactPhone', type: 'string', label: [{ languageCode: LanguageCode.fa, value: 'شماره تماس' }] },
            { name: 'contactAddress', type: 'text', label: [{ languageCode: LanguageCode.fa, value: 'آدرس فروشگاه' }] },
        ],
    },
    plugins: [
        PersianDashboardPlugin,
        CatalogSalePlugin,
        BlogPlugin,
        ZarinpalPlugin,
        GraphiqlPlugin.init(),
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, '../static/assets'),
            // For local dev, the correct value for assetUrlPrefix should
            // be guessed correctly, but for production it will usually need
            // to be set manually to match your production url.
            assetUrlPrefix: process.env.ASSET_URL_PREFIX || undefined,
        }),
        DefaultSchedulerPlugin.init(),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
        EmailPlugin.init({
            devMode: true,
            outputPath: path.join(__dirname, '../static/email/test-emails'),
            route: 'mailbox',
            handlers: defaultEmailHandlers,
            templateLoader: new FileBasedTemplateLoader(path.join(__dirname, '../static/email/templates')),
            globalTemplateVars: {
                // The following variables will change depending on your storefront implementation.
                // Here we are assuming a storefront running at http://localhost:8080.
                fromAddress: '"example" <noreply@example.com>',
                verifyEmailAddressUrl: 'http://localhost:8080/verify',
                passwordResetUrl: 'http://localhost:8080/password-reset',
                changeEmailAddressUrl: 'http://localhost:8080/verify-email-address-change'
            },
        }),
        DashboardPlugin.init({
            route: 'dashboard',
            viteDevServerPort: 5173,
            appDir: IS_DEV
                ? path.join(__dirname, '../dist/dashboard')
                : path.join(__dirname, 'dashboard'),
        }),
    ],
};
