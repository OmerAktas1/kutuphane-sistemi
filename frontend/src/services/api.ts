import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types';
import { useAuthStore } from '@/hooks/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we've already handled a logout to prevent multiple triggers
let isHandlingLogout = false;

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles 401 errors only for actual auth failures
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    // Only handle 401 status codes
    if (error.response?.status === 401) {
      // Prevent multiple logout triggers
      if (isHandlingLogout) {
        return Promise.reject(error);
      }

      // Check if we're on the login page to avoid redirect loops
      const currentPath = window.location.pathname;

      // Only logout if:
      // 1. Not already on login page
      // 2. This is an auth-related endpoint (login, refresh, me)
      // 3. NOT a data endpoint failure (which might be server down)
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/');

      // Check error code/message to determine if this is a real auth failure
      // vs. server being down
      const errorMessage = error.response?.data?.error || '';
      const isRealAuthError = errorMessage.includes('token') ||
        errorMessage.includes('Token') ||
        errorMessage.includes('yetki') ||
        errorMessage.includes('Yetki') ||
        errorMessage.includes('oturum') ||
        errorMessage.includes('Oturum');

      if (currentPath !== '/login') {
        // If backend is down, DON'T logout - just reject
        // Real auth errors only trigger logout
        if (isAuthEndpoint || isRealAuthError) {
          isHandlingLogout = true;
          console.log('[API] Real auth error detected, logging out:', errorMessage);

          // Clear auth state
          useAuthStore.getState().logout();

          // Navigate to login
          window.location.href = '/login';

          // Reset flag after navigation
          setTimeout(() => {
            isHandlingLogout = false;
          }, 1000);
        } else {
          // Server error, not auth error - just log and reject
          console.log('[API] Server error (not auth), not logging out:', errorMessage);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;