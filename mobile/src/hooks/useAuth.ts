import { router } from 'expo-router'
import { toast } from 'sonner-native'
import { useAuthStore, useIsAuthenticated, useCurrentUser } from '@/stores/authStore'
import * as SecureStore from 'expo-secure-store';

// Use the generated Orval hooks directly
import {
  useGetAllauthClientV1AuthSession,
  useDeleteAllauthClientV1AuthSession,
  getGetAllauthClientV1AuthSessionQueryKey,
} from '@/api/generated/auth/authentication-current-session/authentication-current-session'

import {
  usePostAllauthClientV1AuthLogin
} from '@/api/generated/auth/authentication-account/authentication-account'

import {
  PostAllauthClientV1AuthLoginMutationBody,
} from '@/api/generated/auth/authentication-account/authentication-account'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('session_token').then(token => {
      setIsAuthenticated(!!token);
      setIsLoading(false);
    });
  }, []);

  const loginMutation = usePostAllauthClientV1AuthLogin({
    mutation: {
      onSuccess: () => {
        setIsAuthenticated(true);
        router.replace('/cart')
      },
    },
  });
  const login = async (credentials: PostAllauthClientV1AuthLoginMutationBody) => {
    console.log('login');
    loginMutation.mutate({ client: 'app', data: credentials });
    console.log('loginMutation', loginMutation);
  }

  const logoutMutation = useDeleteAllauthClientV1AuthSession({
    mutation: {
      onSuccess: () => {
        console.log('logout mutation success');
        setIsAuthenticated(false);
        SecureStore.deleteItemAsync('session_token');
        SecureStore.deleteItemAsync('access_token');
        console.log('logout');
        router.replace('/login')
      },
    },
  });
  const logout = () => {
    console.log('logout');
    logoutMutation.mutate({ client: 'app' })
    console.log('logoutMutation', logoutMutation);
  }
  const session_token = SecureStore.getItemAsync('session_token');
  const access_token = SecureStore.getItemAsync('access_token');
  return { isLoading, isAuthenticated, login, logout, session_token, access_token, isLoggingIn: loginMutation.isPending, isLoggingOut: logoutMutation.isPending };
}