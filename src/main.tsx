import { RouterProvider, createRouter } from '@tanstack/react-router';
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/trpc/router';
import { TRPCProvider, useTRPC } from './utils/trpc';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });

// Register types for better TypeScript support
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Register service worker and automatically reload on update
const updateSW = registerSW({
  onNeedRefresh() {
    // Automatically reload when new content is available
    updateSW(true);
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: '/api/trpc',
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <RouterProvider router={router} />
      </TRPCProvider>
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
