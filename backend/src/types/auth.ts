import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Kullanıcı adı gerekli'),
  password: z.string().min(1, 'Şifre gerekli'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: 'ADMIN' | 'USER';
  iat?: number;
  exp?: number;
}
