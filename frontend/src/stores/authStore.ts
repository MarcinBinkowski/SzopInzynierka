import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthenticatedResponse } from '@/api/generated/auth/schemas'

interface AuthState {
  session: AuthenticatedResponse | null
  setSession: (session: AuthenticatedResponse | null) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'auth-session',
      partialize: (state) => ({ session: state.session }),
    }
  )
)

export const useIsAuthenticated = () => 
  useAuthStore(state => state.session?.meta?.is_authenticated ?? false)

export const useCurrentUser = () => 
  useAuthStore(state => state.session?.data?.user ?? null)

export const useUserEmail = () => 
  useAuthStore(state => state.session?.data?.user?.email ?? null)

export const useUserDisplayName = () => 
  useAuthStore(state => 
    state.session?.data?.user?.username || 
    state.session?.data?.user?.email || 
    null
  )
