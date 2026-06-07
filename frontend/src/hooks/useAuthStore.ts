import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isHydrated: boolean;
}

interface AuthActions {
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  setHydrated: (hydrated: boolean) => void;
}

// Selector for derived authentication state
export const selectIsAuthenticated = (state: AuthState) =>
  state.isHydrated && !!state.token;

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isHydrated: false,

      login: (user: AuthUser, token: string) => {
        set({ user, token });
      },

      logout: () => {
        set({ user: null, token: null });
      },

      setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated });
      },
    }),
    {
      name: 'kutuphane-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          // Mark hydration as complete
          if (state) {
            state.isHydrated = true;
          }
        };
      },
    }
  )
);

// Hook for checking authentication status with hydration
export const useIsAuthenticated = () => {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const token = useAuthStore((state) => state.token);

  // Don't authenticate until hydrated
  if (!isHydrated) {
    return false;
  }

  return !!token;
};

// Hook for checking if auth is still loading (hydration)
export const useIsAuthLoading = () => {
  return !useAuthStore((state) => state.isHydrated);
};