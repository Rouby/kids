import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Define a unified type for the database
// We use 'any' here because the types between pglite and postgres-js adapters might slightly differ
// but they both conform to the Drizzle Postgres interface.
export let db: any;

const connectionString = process.env.DATABASE_URL;

if (connectionString && connectionString.startsWith('postgres://')) {
  // Production or external Postgres
  const client = postgres(connectionString);
  db = drizzlePostgres(client, { schema });
} else {
  // Local development with PGlite
  const client = new PGlite('./data/kids-pg.db');
  db = drizzlePglite(client, { schema });
}
