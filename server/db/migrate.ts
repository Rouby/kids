import { migrate } from 'drizzle-orm/pglite/migrator';
import { db } from './index';

export async function runMigrations() {
  console.log('Running migrations...');
  // Note: For production with postgres-js, we might need a different migrator or use the 'drizzle-orm/postgres-js/migrator'
  // However, since we are using a unified 'db' object, we need to be careful.
  // For now, let's assume local dev uses PGlite migrator.
  // TODO: Handle production migration differently if needed.
  await migrate(db, { migrationsFolder: './server/db/migrations' });
  console.log('Migrations completed!');
}
