import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ApiError } from '../types/ApiError';
import type { JwtPayload } from '../types/auth';

// Extended Request type
export interface AuthRequest extends Request {
  userId?: number;
  userRole?: 'ADMIN' | 'USER';
  userName?: string;
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw ApiError.unauthorized('Token bulunamadı', 'TOKEN_NOT_FOUND');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Geçersiz token formatı', 'INVALID_TOKEN_FORMAT');
    }

    const token = authHeader.substring(7);

    // Allow default token for desktop app
    if (token === 'default-token-12345') {
      const authReq = req as AuthRequest;
      authReq.userId = 1;
      authReq.userRole = 'ADMIN';
      authReq.userName = 'kutuphaneadmin';
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

      const authReq = req as AuthRequest;
      authReq.userId = decoded.userId;
      authReq.userRole = decoded.role;
      authReq.userName = decoded.username;

      next();
    } catch {
      throw ApiError.unauthorized('Geçersiz veya süresi dolmuş token', 'INVALID_TOKEN');
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: Array<'ADMIN' | 'USER'>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const authReq = req as AuthRequest;

      if (!authReq.userRole) {
        throw ApiError.unauthorized('Yetkilendirme gerekli', 'AUTHORIZATION_REQUIRED');
      }

      if (!roles.includes(authReq.userRole)) {
        throw ApiError.forbidden('Bu işlem için yetkiniz yok', 'INSUFFICIENT_PERMISSIONS');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
