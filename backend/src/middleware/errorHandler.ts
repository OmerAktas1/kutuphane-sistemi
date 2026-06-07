import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types/ApiError';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error
  logger.error(`Request: ${req.method} ${req.path}`);
  logger.error(`Error: ${err.message}`);
  logger.error(`Stack: ${err.stack}`);

  if (err instanceof ApiError) {
    // Log API errors at warn level
    logger.warn(`ApiError: ${err.statusCode} - ${err.message} (${err.code})`);

    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as unknown as { code: string; message: string };
    logger.error(`Prisma Error: ${prismaError.code} - ${prismaError.message}`);

    if (prismaError.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: 'Bu kayit zaten mevcut',
        code: 'DUPLICATE_ENTRY',
      });
      return;
    }
    if (prismaError.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Kayit bulunamadi',
        code: 'NOT_FOUND',
      });
      return;
    }
    res.status(400).json({
      success: false,
      error: 'Veritabani hatasi olustu',
      code: 'DATABASE_ERROR',
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    logger.warn(`JWT Error: ${err.message}`);
    res.status(401).json({
      success: false,
      error: 'Gecersiz veya suresi dolmus token',
      code: 'INVALID_TOKEN',
    });
    return;
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    logger.warn(`Validation Error: ${err.message}`);
    res.status(400).json({
      success: false,
      error: 'Gecersiz veri',
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  // Default error - log as error and return generic message in production
  logger.error(`Unhandled Error: ${err.name} - ${err.message}`);
  logger.error(`Stack: ${err.stack}`);

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Sunucu hatasi olustu'
      : err.message,
    code: 'INTERNAL_ERROR',
  });
};

// Async wrapper to catch errors in async route handlers
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}