import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import { migrate as migratePostgres } from 'drizzle-orm/postgres-js/migrator';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function waitForDatabase(maxRetries = 30, delayMs = 2000) {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString || !connectionString.startsWith('postgres://')) {
    // Local PGlite doesn't need connection waiting
    return;
  }

  console.log('Waiting for database to be ready...');
  console.log('Connection string (masked):', connectionString.replace(/\/\/[^:]+:[^@]+@/, '//***:****@'));
  
  // Create a temporary connection just for checking
  const sql = postgres(connectionString, { 
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: (notice) => {
      console.log('Postgres notice:', notice.message || notice);
    }
  });
  
  try {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`Attempting to connect (${i + 1}/${maxRetries})...`);
        // Try to execute a simple query to verify connection
        await sql`SELECT 1`;
        console.log('Database is ready! Connection successful.');
        return;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : '';
        console.log(`Database not ready yet (attempt ${i + 1}/${maxRetries}):`);
        console.log('Error message:', errorMsg);
        if (errorStack) {
          console.log('Error stack:', errorStack);
        }
        if (i < maxRetries - 1) {
          console.log(`Waiting ${delayMs}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    throw new Error('Database did not become ready in time');
  } finally {
    console.log('Closing temporary connection...');
    await sql.end();
  }
}

export async function runMigrations() {
  console.log('Running migrations...');
  
  const connectionString = process.env.DATABASE_URL;
  const migrationsFolder = join(__dirname, 'migrations');
  
  console.log('Migrations folder:', migrationsFolder);
  console.log('Database URL:', connectionString ? connectionString.replace(/\/\/[^:]+:[^@]+@/, '//***:****@') : 'not set');

  // Wait for database to be ready
  await waitForDatabase();

  // Import db after we know the database is ready
  const { db } = await import('./index');

  if (connectionString && connectionString.startsWith('postgres://')) {
    console.log('Using Postgres migrator');
    await migratePostgres(db, { migrationsFolder });
  } else {
    console.log('Using PGlite migrator');
    await migratePglite(db, { migrationsFolder });
  }

  console.log('Migrations completed!');
}
