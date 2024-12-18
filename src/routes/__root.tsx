import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

//Project Root/Layout
export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
    </>
  ),
});
