import { runMigrations } from './db/migrate';

console.log('Starting standalone migration...');
await runMigrations();
console.log('Standalone migration finished.');
