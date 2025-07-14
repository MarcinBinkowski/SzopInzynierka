import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthenticatedResponse } from "@/api/generated/auth/schemas";
import { Profile } from "@/api/generated/shop/schemas/profile";

export const USER_ROLES = {
  ADMIN: 1,
  EMPLOYEE: 2,
  USER: 3,
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

interface AuthState {
  session: AuthenticatedResponse | null;
  profile: Profile | null;
  setSession: (session: AuthenticatedResponse | null) => void;
  setProfile: (profile: Profile | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      profile: null,
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      clearSession: () => {
        set({ session: null, profile: null });
      },
    }),
    {
      name: "auth-session",
      partialize: (state) => ({
        session: state.session,
        profile: state.profile,
      }),
    },
  ),
);

export const useIsAuthenticated = () =>
  useAuthStore((state) => state.session?.meta?.is_authenticated ?? false);

export const useCurrentUser = () =>
  useAuthStore((state) => state.session?.data?.user ?? null);


export const useIsAdmin = () =>
  useAuthStore((state) => state.profile?.role === USER_ROLES.ADMIN);


export const useCanCreate = () =>
  useAuthStore((state) => state.profile?.role === USER_ROLES.ADMIN);

export const useCanCreateShipments = () =>
  useAuthStore((state) => {
    const role = state.profile?.role;
    return role === USER_ROLES.ADMIN || role === USER_ROLES.EMPLOYEE;
  });

export const useCanManageOrders = () =>
  useAuthStore((state) => {
    const role = state.profile?.role;
    return role === USER_ROLES.ADMIN || role === USER_ROLES.EMPLOYEE;
  });

export const useCanManageOrderNotes = () =>
  useAuthStore((state) => {
    const role = state.profile?.role;
    return role === USER_ROLES.ADMIN || role === USER_ROLES.EMPLOYEE;
  });

export const useCanManageProducts = () =>
  useAuthStore((state) => state.profile?.role === USER_ROLES.ADMIN);
