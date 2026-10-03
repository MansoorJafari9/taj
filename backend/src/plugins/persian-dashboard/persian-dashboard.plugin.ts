import { VendurePlugin } from '@vendure/core';

/**
 * Dashboard-only customizations for Persian-speaking administrators.
 * Keeping these in a plugin prevents changes to Vendure's own Dashboard files.
 */
@VendurePlugin({
    dashboard: './dashboard/index.tsx',
})
export class PersianDashboardPlugin {}
