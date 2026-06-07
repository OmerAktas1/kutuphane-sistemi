import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// PrismaClient options for SQLite
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

// Store in global to prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Log connection info
logger.info('Prisma client initialized');
logger.info(`Database URL: ${process.env.DATABASE_URL || 'file:./data/kutuphane.db'}`);

export async function connectDatabase(): Promise<void> {
  try {
    // Test connection with a simple query
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Verify connection with a ping
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection verified');
  } catch (error) {
    logger.error('Database connection failed:', error);
    if (error instanceof Error) {
      logger.error(`Database error message: ${error.message}`);
      logger.error(`Database error stack: ${error.stack}`);
    }
    throw error; // Re-throw to let the caller handle it
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Database disconnection failed:', error);
  }
}

// Graceful shutdown handler
export async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`${signal} received. Closing database connection...`);
  try {
    await disconnectDatabase();
    logger.info('Graceful shutdown completed');
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
  }
}

export default prisma;