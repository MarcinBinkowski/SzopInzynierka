import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useDeleteAllauthClientV1AuthSession } from "@/api/generated/auth/authentication-current-session/authentication-current-session";
import { usePostAllauthClientV1AuthLogin } from "@/api/generated/auth/authentication-account/authentication-account";
import { PostAllauthClientV1AuthLoginMutationBody } from "@/api/generated/auth/authentication-account/authentication-account";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useAuthStore } from "@/stores/authStore";
import { AuthenticatedResponse } from "@/api/generated/auth/schemas";

// uncomment to clear session token and user if any error occurs (debug only)
// SecureStore.deleteItemAsync("session_token");
// SecureStore.deleteItemAsync("user");

export interface UseAuthResult {
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    credentials: PostAllauthClientV1AuthLoginMutationBody,
  ) => void | Promise<void>;
  logout: () => void;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  loginError: string | null;
  currentUser: any;
  userEmail: string | null;
}

export function useAuth(): UseAuthResult {
  const { session, setSession } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  const currentUser = session?.data?.user ?? null;
  const userEmail = currentUser?.email ?? null;
  const isAuthenticated = !!session?.meta?.session_token;

  useEffect(() => {
    (async () => {
      try {
        const [token, userData] = await Promise.all([
          SecureStore.getItemAsync("session_token"),
          SecureStore.getItemAsync("user"),
        ]);
        if (token && userData) {
          const user = JSON.parse(userData);
          const hydrated: AuthenticatedResponse = {
            status: 200 as const,
            data: { user, methods: [] },
            meta: { is_authenticated: true, session_token: token },
          };
          setSession(hydrated);
        }
      } catch (e) {
        console.warn("Auth hydrate failed:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [setSession]);

  const loginMutation = usePostAllauthClientV1AuthLogin({
    mutation: {
      onSuccess: async (response) => {
        if (response.meta?.session_token) {
          await SecureStore.setItemAsync("session_token", response.meta.session_token);
        }
        if (response.data.user) {
          await SecureStore.setItemAsync("user", JSON.stringify(response.data.user));
        }
        setSession(response);
        router.replace("/main");
      },
      onError: (_: AxiosError) => {
        setLoginError(`Login failed. Please check your credentials.`);
      },
    },
  });

  const login = async (credentials: PostAllauthClientV1AuthLoginMutationBody) => {
    loginMutation.mutateAsync({ client: "app", data: credentials });
  };

  const logoutMutation = useDeleteAllauthClientV1AuthSession({
    mutation: {
      onSuccess: async () => {
        await SecureStore.deleteItemAsync("session_token");
        await SecureStore.deleteItemAsync("user");
        setSession(null);
        router.replace("/login");
      },
      onError: async () => {
        await SecureStore.deleteItemAsync("session_token");
        await SecureStore.deleteItemAsync("user");
        setSession(null);
        router.replace("/login");
      },
    },
  });

  const logout = () => {
    logoutMutation.mutate({ client: "app" });
  };
  return {
    isLoading,
    isAuthenticated,
    login,
    logout,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError,
    currentUser,
    userEmail,
  };
}
