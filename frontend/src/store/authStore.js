import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

export const authStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Acciones
      setUser: (user) => set({ user }),
      setToken: (token) => {
        Cookies.set('auth_token', token, { expires: 7 });
        set({ token });
      },
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Login
      login: (user, token) => {
        Cookies.set('auth_token', token, { expires: 7 });
        set({ user, token, error: null });
      },

      // Logout
      logout: () => {
        Cookies.remove('auth_token');
        set({ user: null, token: null, error: null });
      },

      // Check auth status
      isAuthenticated: () => {
        const state = authStore.getState();
        return !!state.token && !!state.user;
      },

      // Cleanup
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
