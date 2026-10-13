import { useEffect } from 'react';
import { useAuth } from '@/vdb/hooks/use-auth.js';
import { useExtendedRouter as useVendureExtendedRouter } from '../../../../node_modules/@vendure/dashboard/src/lib/framework/page/use-extended-router';

// Vendure replaces the router after loading extension routes. TanStack's
// mounted Transitioner does not initialize that replacement automatically.
export const useExtendedRouter: typeof useVendureExtendedRouter = (...args) => {
    const auth = useAuth();
    const router = useVendureExtendedRouter(...args);
    useEffect(() => {
        // InnerApp can render a boot splash instead of RouterProvider while
        // server config loads after login. Supply auth before running loaders.
        router.update({ context: { ...router.options.context, auth } });
        void router.load();
    }, [router]);
    return router;
};
