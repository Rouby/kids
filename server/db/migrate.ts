import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import { migrate as migratePostgres } from 'drizzle-orm/postgres-js/migrator';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from './index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function waitForDatabase(maxRetries = 10, delayMs = 2000) {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString || !connectionString.startsWith('postgres://')) {
    // Local PGlite doesn't need connection waiting
    return;
  }

  console.log('Waiting for database to be ready...');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Try to execute a simple query to verify connection
      await db.execute('SELECT 1');
      console.log('Database is ready!');
      return;
    } catch (error) {
      console.log(`Database not ready yet (attempt ${i + 1}/${maxRetries}):`, error instanceof Error ? error.message : String(error));
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw new Error('Database did not become ready in time');
}

export async function runMigrations() {
  console.log('Running migrations...');
  
  const connectionString = process.env.DATABASE_URL;
  const migrationsFolder = join(__dirname, 'migrations');
  
  console.log('Migrations folder:', migrationsFolder);
  console.log('Database URL:', connectionString ? connectionString.replace(/:[^:]*@/, ':****@') : 'not set');

  // Wait for database to be ready
  await waitForDatabase();

  if (connectionString && connectionString.startsWith('postgres://')) {
    console.log('Using Postgres migrator');
    await migratePostgres(db, { migrationsFolder });
  } else {
    console.log('Using PGlite migrator');
    await migratePglite(db, { migrationsFolder });
  }

  console.log('Migrations completed!');
}
