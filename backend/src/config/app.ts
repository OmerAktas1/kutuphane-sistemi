import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './index';
import { logger } from '../utils/logger';
import { ApiError } from '../types/ApiError';
import routes from '../routes';

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS
  app.use(cors({
    origin: config.cors.origin,
    credentials: true,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Cok fazla istek, lutfen daha sonra tekrar deneyin.' },
  });
  app.use('/api', limiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logging
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }));

  // Health check
  app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes - MUST be before static files
  app.use('/api/v1', routes);

  // Serve static frontend files
  const frontendPath = path.join(process.cwd(), '..', 'frontend', 'dist');
  app.use(express.static(frontendPath));

  // Serve frontend for all other routes (SPA support)
  app.get('*', (_req: Request, res: Response) => {
    const indexPath = path.join(frontendPath, 'index.html');
    res.sendFile(indexPath);
  });

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    logger.error('Unhandled error:', err);

    if (err instanceof ApiError) {
      res.status(err.statusCode).json({
        success: false,
        error: err.message,
        code: err.code,
      });
      return;
    }

    // Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
      res.status(400).json({
        success: false,
        error: 'Veritabani hatasi',
        code: 'DATABASE_ERROR',
      });
      return;
    }

    // Validation errors
    if (err.name === 'ZodError') {
      res.status(400).json({
        success: false,
        error: 'Dogrulama hatasi',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    // Default error
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production'
        ? 'Sunucu hatasi'
        : err.message,
      code: 'INTERNAL_ERROR',
    });
  });

  return app;
}
