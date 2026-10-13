import './toman-currency-display.js';
import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/500.css';
import '@fontsource/vazirmatn/600.css';
import '@fontsource/vazirmatn/700.css';
import './vazirmatn.css';

import { defineDashboardExtension } from '@vendure/dashboard';
import { SiteAssetInput } from './site-asset-input';

defineDashboardExtension({
    customFormComponents: {
        customFields: [{ id: 'site-image-picker', component: SiteAssetInput }],
    },
});
