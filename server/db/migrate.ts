import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { db } from './index';

export async function runMigrations() {
  console.log('Running migrations...');
  migrate(db, { migrationsFolder: './server/db/migrations' });
  console.log('Migrations completed!');
}
