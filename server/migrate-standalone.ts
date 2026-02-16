import { runMigrations } from './db/migrate';

console.log('Starting standalone migration...');

try {
  await runMigrations();
  console.log('Standalone migration finished successfully.');
  process.exit(0);
} catch (error) {
  console.error('Migration failed with error:');
  console.error(error);
  process.exit(1);
}