import api from './api';
import type { AuthUser } from '@/types';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  token: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<{ success: boolean; data: LoginResponse }>('/auth/login', data);
    return response.data.data!;
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const response = await api.post<{ success: boolean; data: RefreshResponse }>('/auth/refresh', {
      refreshToken,
    });
    return response.data.data!;
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await api.get<{ success: boolean; data: AuthUser }>('/auth/me');
    return response.data.data!;
  },

  async logout(): Promise<void> {
    // Server-side logout if needed
    await api.post('/auth/logout');
  },
};
