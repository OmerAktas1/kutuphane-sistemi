import dotenv from 'dotenv';

dotenv.config();

// Get database path - support both absolute and relative paths
function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  if (envUrl) {
    // If DATABASE_URL is provided, use it as-is
    // This handles cases like "file:./data/kutuphane.db" or absolute paths
    return envUrl;
  }

  // Default to relative path in data directory
  return 'file:./data/kutuphane.db';
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),

  database: {
    url: getDatabaseUrl(),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  api: {
    prefix: '/api/v1',
  },

  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
  },

  borrowing: {
    defaultBorrowDays: 14,
    maxBorrowDays: 30,
    dailyLateFee: 1.0,
    maxBorrowLimit: 5,
  },

  reservation: {
    reservationExpiryDays: 3,
    maxActiveReservations: 3,
  },
} as const;

export type Config = typeof config;
