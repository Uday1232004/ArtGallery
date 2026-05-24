import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrating: true, // App starts in hydration state
      _initStarted: false,
      
      isAdmin: () => {
        const role = get().user?.role;
        return role === 'SUPER_ADMIN' || role === 'MANAGER' || role === 'ARTIST';
      },
      
      login: (user, token) => {
        console.log('[Auth Store] login action invoked. Storing user and token. User:', user);
        set({ user, token, isAuthenticated: true });
      },
      
      logout: () => {
        console.log('[Auth Store] logout action invoked. Clearing session.');
        // Let Zustand's persist manage the storage write naturally
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
      
      initAuth: async () => {
        if (get()._initStarted) {
          console.log('[Auth Store] initAuth already in progress. Skipping duplicate execution.');
          return;
        }
        set({ _initStarted: true });
        
        const { token } = get();
        console.log('[Auth Store] initAuth triggered. Token exists in store:', !!token);
        
        if (!token) {
          console.log('[Auth Store] No token found in store. Setting isHydrating to false, isAuthenticated to false.');
          set({ isHydrating: false, isAuthenticated: false, user: null, _initStarted: false });
          return;
        }

        try {
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
          console.log(`[Auth Store] /auth/me request starting. URL: ${baseUrl}/auth/me`);
          
          const response = await fetch(`${baseUrl}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`Token validation failed with status: ${response.status}`);
          }

          const userData = await response.json();
          console.log('[Auth Store] auth success. /auth/me resolved successfully. User data:', userData);
          set({ user: userData, isAuthenticated: true, isHydrating: false, _initStarted: false });
        } catch (error) {
          console.error('[Auth Store] auth failure. /auth/me failed:', error.message);
          set({ user: null, token: null, isAuthenticated: false, isHydrating: false, _initStarted: false });
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist the token and user data, NOT the loading/hydrating state
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: (state) => {
        console.log('[Auth Store] hydration start. State before rehydration:', state);
        return (hydratedState, error) => {
          if (error) {
            console.error('[Auth Store] hydration failed with error:', error);
          } else {
            console.log('[Auth Store] hydration complete. State after rehydration:', hydratedState);
            // We NO LONGER call hydratedState.initAuth() here.
            // We let App.jsx trigger initAuth() in its useEffect.
            // This ensures get() will return the fully hydrated state.
          }
        };
      },
    }
  )
);

