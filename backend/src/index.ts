import { bootstrap, runMigrations } from '@vendure/core';
import { config } from './vendure-config';

runMigrations(config)
    .then(() => {
        // Vendure can report a migration failure through exitCode without rejecting.
        if (process.exitCode) return;
        return bootstrap(config);
    })
    .catch(err => {
        console.log(err);
        process.exitCode = 1;
    });
