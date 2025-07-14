import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

import { useDeleteAllauthClientV1AuthSession } from "@/api/generated/auth/authentication-current-session/authentication-current-session";

import { usePostAllauthClientV1AuthLogin } from "@/api/generated/auth/authentication-account/authentication-account";

import { PostAllauthClientV1AuthLoginMutationBody } from "@/api/generated/auth/authentication-account/authentication-account";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";

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
}

export function useAuth(): UseAuthResult {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync("session_token");
      setIsAuthenticated(!!token);
      setIsLoading(false);
    })();
  }, []);

  const loginMutation = usePostAllauthClientV1AuthLogin({
    mutation: {
      onSuccess: async (response) => {
        if (response.meta?.session_token) {
          await SecureStore.setItemAsync(
            "session_token",
            response.meta.session_token,
          );
        }
        if (response.data.user) {
          await SecureStore.setItem("user", JSON.stringify(response.data.user));
        }
        setIsAuthenticated(true);

        router.replace("/main");
      },
      onError: (error: AxiosError) => {
        setLoginError(
          `Login failed. Please try again. ${error.response?.data}`,
        );
      },
    },
  });
  const login = async (
    credentials: PostAllauthClientV1AuthLoginMutationBody,
  ) => {
    loginMutation.mutate({ client: "app", data: credentials });
  };

  const logoutMutation = useDeleteAllauthClientV1AuthSession({
    mutation: {
      onSuccess: async () => {
        await SecureStore.deleteItemAsync("session_token");
        await SecureStore.deleteItemAsync("user");
        setIsAuthenticated(false);
        router.replace("/login");
      },
      onError: async (error: AxiosError) => {
        await SecureStore.deleteItemAsync("session_token");
        await SecureStore.deleteItemAsync("user");
        setIsAuthenticated(false);
        router.replace("/login");
        
        if (error.response?.status !== 410) {
          console.warn("Logout API failed, but cleared local session:", error.message);
        }
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
  };
}
