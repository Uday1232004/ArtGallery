import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrating: true, // App starts in hydration state
      isAdmin: () => {
        const role = get().user?.role;
        return role === 'SUPER_ADMIN' || role === 'MANAGER' || role === 'ARTIST';
      },
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        localStorage.removeItem('auth-storage');
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
      initAuth: async () => {
        const { token } = get();
        if (!token) {
          // No token saved, stop hydrating
          set({ isHydrating: false, isAuthenticated: false, user: null });
          return;
        }

        try {
          // Validate token and fetch fresh user data
          const response = await api.get('/auth/me');
          set({ user: response.data, isAuthenticated: true, isHydrating: false });
        } catch (error) {
          // Token is invalid, expired, or server is down
          console.error('Auth hydration failed:', error.message);
          get().logout();
          set({ isHydrating: false });
        }
      }
    }),
    {
      name: 'auth-storage',
      // Only persist the token and user data, NOT the loading/hydrating state
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
