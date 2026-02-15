import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import { migrate as migratePostgres } from 'drizzle-orm/postgres-js/migrator';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from './index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function runMigrations() {
  console.log('Running migrations...');
  
  const connectionString = process.env.DATABASE_URL;
  const migrationsFolder = join(__dirname, 'migrations');
  
  console.log('Migrations folder:', migrationsFolder);

  if (connectionString && connectionString.startsWith('postgres://')) {
    console.log('Using Postgres migrator');
    await migratePostgres(db, { migrationsFolder });
  } else {
    console.log('Using PGlite migrator');
    await migratePglite(db, { migrationsFolder });
  }

  console.log('Migrations completed!');
}
