import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import { registerSW } from 'virtual:pwa-register';

const theme = createTheme({
  /** Put your mantine theme override here */
});

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
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </React.StrictMode>,
);
