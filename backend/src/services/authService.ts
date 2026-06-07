import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../config/database';
import { ApiError } from '../types/ApiError';
import type { LoginResponse, JwtPayload, AuthUser } from '../types/auth';

// Sistemde sadece admin kullanicilar oldugu icin sabit rol kullaniyoruz
const SYSTEM_ROLE: 'ADMIN' = 'ADMIN';

export class AuthService {
  async login(username: string, password: string): Promise<LoginResponse> {
    // Kullanicayi username veya email ile bul
    const user = await prisma.member.findFirst({
      where: {
        OR: [
          { memberNo: username },
          { email: username },
        ],
        status: 'ACTIVE',
      },
    });

    if (!user) {
      throw ApiError.unauthorized('Gecersiz kullanici adi veya sifre', 'INVALID_CREDENTIALS');
    }

    // Sifreyi dogrula
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Gecersiz kullanici adi veya sifre', 'INVALID_CREDENTIALS');
    }

    // Token olustur - sistemde sadece admin rol var
    const tokens = this.generateTokens(user.id, user.memberNo, SYSTEM_ROLE);

    return {
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        username: user.memberNo,
        email: user.email,
        role: SYSTEM_ROLE,
      },
    };
  }

  generateTokens(userId: number, username: string, role: 'ADMIN' | 'USER'): { token: string; refreshToken: string } {
    const payload: JwtPayload = {
      userId,
      username,
      role,
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
    });

    return { token, refreshToken };
  }

  verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      return decoded;
    } catch {
      throw ApiError.unauthorized('Gecersiz veya suresi dolmus token', 'INVALID_TOKEN');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ token: string }> {
    try {
      const decoded = this.verifyToken(refreshToken);

      const user = await prisma.member.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw ApiError.unauthorized('Kullanici bulunamadi veya aktif degil', 'USER_NOT_FOUND');
      }

      const newToken = jwt.sign(
        {
          userId: user.id,
          username: user.memberNo,
          role: SYSTEM_ROLE,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] }
      );

      return { token: newToken };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.unauthorized('Gecersiz refresh token', 'INVALID_REFRESH_TOKEN');
    }
  }

  async getCurrentUser(userId: number): Promise<AuthUser | null> {
    const user = await prisma.member.findUnique({
      where: { id: userId },
      select: {
        id: true,
        memberNo: true,
        email: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.memberNo,
      email: user.email,
      role: SYSTEM_ROLE,
    };
  }
}

export const authService = new AuthService();
