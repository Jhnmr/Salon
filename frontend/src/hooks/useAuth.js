import { useEffect } from 'react';
import { authStore } from '../store/authStore';
import { authService } from '../services/api';

export const useAuth = () => {
  const user = authStore((state) => state.user);
  const token = authStore((state) => state.token);
  const isLoading = authStore((state) => state.isLoading);
  const error = authStore((state) => state.error);
  const setUser = authStore((state) => state.setUser);
  const setToken = authStore((state) => state.setToken);
  const setLoading = authStore((state) => state.setLoading);
  const setError = authStore((state) => state.setError);
  const login = authStore((state) => state.login);
  const logout = authStore((state) => state.logout);
  const clearError = authStore((state) => state.clearError);

  // Verificar usuario actual al cargar
  useEffect(() => {
    if (token && !user) {
      setLoading(true);
      authService
        .getCurrentUser()
        .then((res) => {
          setUser(res.data.user);
        })
        .catch((err) => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [token]);

  const registerUser = async (name, email, password, passwordConfirmation, role) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role,
      });
      login(res.data.user, res.data.token);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.error || 'Error en el registro';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(email, password);
      login(res.data.user, res.data.token);
      return res.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || 'Error en el inicio de sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Error al cerrar sesión', err);
    } finally {
      logout();
    }
  };

  const isAuthenticated = !!token && !!user;

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    registerUser,
    loginUser,
    logoutUser,
    clearError,
  };
};
