import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'


export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Outlet />
      <TanStackRouterDevtools />
      <Toaster/>
    </ThemeProvider>
  ),
})