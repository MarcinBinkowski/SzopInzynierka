import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles.css";

import { routeTree } from "./routeTree.gen";
import { authClient } from "./api/auth-mutator";
import { RouterContext } from "./types/router";
import reportWebVitals from "./reportWebVitals";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 0,
      retry: 3,
    },
  },
});

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
  } as RouterContext,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const initializeAuth = async () => {
  try {
    await authClient.get("/_allauth/browser/v1/config");
    console.log("Auth configuration initialized");
  } catch (error) {
    console.error("Failed to initialize auth config:", error);
  }
};

const startApp = async () => {
  await initializeAuth();

  const rootElement = document.getElementById("app");
  if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </StrictMode>,
    );
  }
};

startApp();
reportWebVitals();
