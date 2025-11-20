import { RouterProvider, createRouter } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
