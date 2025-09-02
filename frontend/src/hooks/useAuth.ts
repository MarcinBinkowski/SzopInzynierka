import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore, useIsAuthenticated, useCurrentUser, USER_ROLES } from '@/stores/authStore'

// Use the generated Orval hooks directly
import {
  useGetAllauthClientV1AuthSession,
  useDeleteAllauthClientV1AuthSession,
  getGetAllauthClientV1AuthSessionQueryKey,
} from '@/api/generated/auth/authentication-current-session/authentication-current-session'

import {
  useGetAllauthClientV1Config
} from '@/api/generated/auth/configuration/configuration'

import {
  usePostAllauthClientV1AuthLogin
} from '@/api/generated/auth/authentication-account/authentication-account'

import {
  PostAllauthClientV1AuthLoginMutationBody,
} from '@/api/generated/auth/authentication-account/authentication-account'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useProfileProfilesMeRetrieve } from '@/api/generated/shop/profile/profile'

export const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setSession, setProfile, clearSession } = useAuthStore()
  const isAuthenticated = useIsAuthenticated()
  
  const sessionQuery = useGetAllauthClientV1AuthSession('browser', {
    query: {
      retry: false,
    },
  })

  const configQuery = useGetAllauthClientV1Config('browser', {
    query: {
      enabled: false,
      retry: false,
    },
  })

  const profileQuery = useProfileProfilesMeRetrieve({
    query: {
      enabled: isAuthenticated,
      retry: false,
    },
  })

  useEffect(() => {
    if (sessionQuery.data) {
      setSession(sessionQuery.data)
    }
  }, [sessionQuery.data, setSession])

  useEffect(() => {
    if (profileQuery.data) {
      setProfile(profileQuery.data)
      if (profileQuery.data.role === USER_ROLES.USER) {
        toast.error('Access denied. Users cannot access the dashboard.')
        clearSession()
        navigate({ to: '/login', replace: true })
        return
      }
      
      if (window.location.pathname === '/login') {
        navigate({ to: '/dashboard', replace: true })
        toast.success('Welcome back!')
      }
    }
  }, [profileQuery.data, setProfile, clearSession, navigate])

  useEffect(() => {
    if (sessionQuery.error && sessionQuery.error.status === 401) {
      clearSession();
    }
  }, [sessionQuery.error, clearSession]);

  const loginMutation = usePostAllauthClientV1AuthLogin({
    mutation: {
      onSuccess: (data) => {
        setSession(data)
      },
      onError: (error: any) => {
        if ([401, 403, 409].includes(error?.response?.status)) {
          clearSession()
          queryClient.clear()
          
          if (error?.response?.data?.errors) {
            const errors = error.response.data.errors
            const roleError = errors.find((err: any) => err.code === 'insufficient_permissions')
            if (roleError) {
              toast.error(roleError.message)
              return
            }
          }
          toast.error('Access denied. Please check your permissions.')
          return
        } 
        
        // Handle other login errors
        if (error?.response?.data?.errors) {
          const firstError = error.response.data.errors[0]
          if (firstError?.message) {
            toast.error(firstError.message)
            return
          }
        }
        
        // Fallback error message
        toast.error('Login failed. Please check your credentials.')
      },
    },
  })

  const logoutMutation = useDeleteAllauthClientV1AuthSession({
    mutation: {
      onSuccess: async () => {
        clearSession()
        queryClient.clear()
        
        try {
          await configQuery.refetch()
        } catch (error) {
          console.log('Failed to refresh CSRF token:', error)
        }
        
        toast.success('Logged out successfully')
        navigate({ to: '/login', replace: true })
      },
      onError: (error: any) => {
        console.log('Logout error:', error)
        if (error?.status === 401 || error?.response?.status === 401) {
          clearSession()
          queryClient.removeQueries({
            queryKey: getGetAllauthClientV1AuthSessionQueryKey('browser'),
          })
          queryClient.removeQueries({
            queryKey: ['profile'],
          })
          toast.success('Logged out')
          navigate({ to: '/login', replace: true })
        } else {
          console.log('Actual logout error:', error)
          clearSession()
          queryClient.removeQueries({
            queryKey: getGetAllauthClientV1AuthSessionQueryKey('browser'),
          })
          queryClient.removeQueries({
            queryKey: ['profile'],
          })
          toast.error('Logout failed, but cleared local session')
          navigate({ to: '/login', replace: true })
        }
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
    isAuthenticated: useIsAuthenticated(),
    user: useCurrentUser(),
    
    isLoading: sessionQuery.isLoading || profileQuery.isLoading || loginMutation.isPending || logoutMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    
    // Actions
    login,
    logout,
    checkAuth: sessionQuery.refetch,
    
    // Session data
    session: useAuthStore(state => state.session),
  }
}