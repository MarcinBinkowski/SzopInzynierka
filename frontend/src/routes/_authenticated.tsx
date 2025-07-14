import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { useAuthStore, useIsAuthenticated } from "@/stores/authStore"
import DashboardLayout from "@/components/layout/DashboardLayout"

/**
 * Authentication wrapper component
 * Handles loading states and authentication checks
 */
function AuthenticatedWrapper() {
  const isAuthenticated = useIsAuthenticated()

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center space-y-4">
          <div className="text-red-600 text-xl">🔒</div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Authentication Required
            </h2>
            <p className="text-gray-600">
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // User is authenticated, render with dashboard layout
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}

/**
 * Route configuration with authentication guard
 * Uses the session API to check authentication status
 */
export const Route = createFileRoute("/_authenticated")({
  // Server-side authentication check using TanStack Query
  beforeLoad: () => {
    const isAuthenticated = useAuthStore.getState().session?.meta?.is_authenticated
    if (!isAuthenticated) {
      throw redirect({ to: "/login" })
    }
  },
  // Use the wrapper component that handles auth state
  component: AuthenticatedWrapper,
})