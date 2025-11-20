import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

const theme = createTheme({
  /** Put your mantine theme override here */
});

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <MantineProvider theme={theme}>
      <Outlet />
      <TanStackRouterDevtools />
    </MantineProvider>
  );
}
