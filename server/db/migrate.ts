import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import { migrate as migratePostgres } from 'drizzle-orm/postgres-js/migrator';
import { db } from './index';

export async function runMigrations() {
  console.log('Running migrations...');
  
  const connectionString = process.env.DATABASE_URL;

  if (connectionString && connectionString.startsWith('postgres://')) {
    console.log('Using Postgres migrator');
    await migratePostgres(db, { migrationsFolder: './server/db/migrations' });
  } else {
    console.log('Using PGlite migrator');
    await migratePglite(db, { migrationsFolder: './server/db/migrations' });
  }

  console.log('Migrations completed!');
}
