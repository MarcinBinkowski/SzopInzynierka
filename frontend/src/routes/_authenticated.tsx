import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore, useIsAuthenticated } from "@/stores/authStore";
import DashboardLayout from "@/components/layout/DashboardLayout";

function AuthenticatedWrapper() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center space-y-4">
          <div className="text-red-600 text-xl">🔒</div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Authentication Required
            </h2>
            <p className="text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    const state = useAuthStore.getState();
    const isAuthenticated = state.session?.meta?.is_authenticated;

    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthenticatedWrapper,
});
