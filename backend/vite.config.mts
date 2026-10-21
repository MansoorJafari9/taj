import { vendureDashboardPlugin } from '@vendure/dashboard/vite';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
import { defineConfig } from 'vite';

export default defineConfig({
    base: '/dashboard',
    build: {
        outDir: join(__dirname, 'dist/dashboard'),
    },
    // Dashboard sources live in node_modules and import local extensions and
    // shared dependencies. Allow the backend root so all of them can be served.
    server: {
        port: 5173,
        strictPort: true,
        fs: {
            allow: [
                resolve(__dirname),
            ],
        },
    },
    plugins: [
        vendureDashboardPlugin({
            // Vendure Dashboard includes an official Persian translation catalog and
            // switches its layout to RTL when the display language is Persian.
            i18n: {
                defaultLanguage: 'fa',
                defaultLocale: 'fa-IR',
                availableLanguages: ['fa'],
                availableLocales: ['fa-IR'],
            },
            // The vendureDashboardPlugin will scan your configuration in order
            // to find any plugins which have dashboard extensions, as well as
            // to introspect the GraphQL schema based on any API extensions
            // and custom fields that are configured.
            vendureConfigPath: pathToFileURL('./src/vendure-config.ts'),
            // Points to the location of your Vendure server.
            // In production, 'auto' lets the dashboard derive the API URL from the
            // server that serves it. In development, we use explicit defaults so that
            // the Vite dev server can reach the Vendure backend.
            api: process.env.NODE_ENV === 'production'
                ? { host: 'auto', port: 'auto' }
                : { host: 'http://127.0.0.1', port: 3000 },
            // When you start the Vite server, your Admin API schema will
            // be introspected and the types will be generated in this location.
            // These types can be used in your dashboard extensions to provide
            // type safety when writing queries and mutations.
            gqlOutputPath: './src/gql',
        }),
    ],
    resolve: {
        alias: {
            // The product route imports this component relatively. Keep our fix
            // outside node_modules so clean Docker builds retain it.
            './components/generate-variants-panel.js': resolve(__dirname, './src/plugins/persian-dashboard/dashboard/generate-variants-panel.tsx'),
            '@/vdb/framework/page/use-extended-router.js': resolve(__dirname, './src/plugins/persian-dashboard/dashboard/use-extended-router.ts'),
            // Vendure's built-in MoneyInput hard-codes two decimals. Replace only
            // its Dashboard component so IRR/IRT inputs can show whole tomans.
            '@/vdb/components/data-input/money-input.js': resolve(__dirname, './src/plugins/persian-dashboard/dashboard/whole-toman-money-input.tsx'),
            // This allows all plugins to reference a shared set of
            // GraphQL types.
            '@/gql': resolve(__dirname, './src/gql/graphql.ts'),
        },
    },
});
