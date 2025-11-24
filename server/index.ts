import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './trpc/router';
import { join } from 'path';
import { runMigrations } from './db/migrate';

const PORT = process.env.PORT || 3000;
const distPath = join(import.meta.dir, '../dist');

// Initialize database and run migrations
await runMigrations();

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Handle tRPC API requests
    if (url.pathname.startsWith('/api/trpc')) {
      return fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext: () => ({}),
      });
    }

    // Serve static files
    try {
      const filePath = join(distPath, url.pathname === '/' ? 'index.html' : url.pathname);
      
      // Try to read the file
      let file = Bun.file(filePath);
      if (!(await file.exists())) {
        // If file not found, serve index.html for SPA routing
        file = Bun.file(join(distPath, 'index.html'));
      }

      return new Response(file);
    } catch (error) {
      return new Response('Not Found', { status: 404 });
    }
  },
});

console.log(`Server running at http://localhost:${PORT}`);
