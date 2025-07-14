import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore, useIsAuthenticated, useCurrentUser } from '@/stores/authStore'

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
import { useEffect } from 'react'

export const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setSession, clearSession } = useAuthStore()
  
  // Use Orval-generated hooks directly
  const sessionQuery = useGetAllauthClientV1AuthSession('browser', {
    query: {},
  })

  // Handle successful session fetch
  useEffect(() => {
    if (sessionQuery.data) {
      setSession(sessionQuery.data)
    }
  }, [sessionQuery.data, setSession])

  const loginMutation = usePostAllauthClientV1AuthLogin({
    mutation: {
      onSuccess: (data) => {
        setSession(data)
        toast.success('Welcome back!')
        navigate({ to: '/dashboard', replace: true })
      },
    },
  })

  const logoutMutation = useDeleteAllauthClientV1AuthSession({
    mutation: {
      onSuccess: () => {
        clearSession()
        toast.success('Logged out')
        queryClient.removeQueries({
          queryKey: getGetAllauthClientV1AuthSessionQueryKey('browser'),
        })
        navigate({ to: '/login', replace: true })
      },
    },
  })

  const login = (credentials: PostAllauthClientV1AuthLoginMutationBody) => {
    loginMutation.mutate({ client: 'browser', data: credentials })
  }

  const logout = () => {
    logoutMutation.mutate({ client: 'browser' })
  }

  return {
    // State from store
    isAuthenticated: useIsAuthenticated(),
    user: useCurrentUser(),
    
    // Loading states from mutations
    isLoading: sessionQuery.isLoading || loginMutation.isPending || logoutMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    
    // Actions
    login,
    logout,
    checkAuth: sessionQuery.refetch,
    
    // Session data
    session: useAuthStore(state => state.session),
  }
}