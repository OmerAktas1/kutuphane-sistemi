import { createApp } from './config/app';
import { config } from './config';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';
import fs from 'fs';
import path from 'path';

// Global error tracking
let isShuttingDown = false;

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Ensure data directory exists for SQLite
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function main(): Promise<void> {
  logger.info('='.repeat(60));
  logger.info('Backend sunucusu baslatiliyor...');
  logger.info(`Timestamp: ${new Date().toISOString()}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`Node Version: ${process.version}`);
  logger.info(`Port: ${config.port}`);
  logger.info(`Database URL: ${config.database.url}`);
  logger.info('='.repeat(60));

  let server: ReturnType<ReturnType<typeof createApp>['listen']> | null = null;

  try {
    // Connect to database
    logger.info('Veritabani baglantisi yapiliyor...');
    await connectDatabase();
    logger.info('Veritabani baglantisi basarili');

    // Create Express app
    logger.info('Express uygulamasi olusturuluyor...');
    const app = createApp();
    logger.info('Express uygulamasi olusturuldu');

    // Start server
    logger.info(`Sunucu ${config.port} portunda baslatiliyor...`);
    server = app.listen(config.port, () => {
      logger.info('='.repeat(60));
      logger.info('Sunucu basariyla baslatildi!');
      logger.info(`URL: http://localhost:${config.port}`);
      logger.info(`Health Check: http://localhost:${config.port}/api/v1/health`);
      logger.info(`API Documentation: http://localhost:${config.port}/api-docs`);
      logger.info('='.repeat(60));
    });

    // Server error handling
    server.on('error', (error: NodeJS.ErrnoException) => {
      logger.error('='.repeat(50));
      logger.error('SUNUCU HATASI!');
      logger.error('='.repeat(50));

      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} zaten kullaniliyor!`);
        logger.error('Bu portu kullanan diger uygulamalari kapatin.');
        logger.error('Cozum: netstat -ano | findstr 3001');
      } else if (error.code === 'EACCES') {
        logger.error('Yetki hatasi - Bu portu kullanma yetkiniz yok.');
      } else {
        logger.error(`Sunucu hatasi: ${error.message}`);
        logger.error(`Hata kodu: ${error.code}`);
      }

      if (!isShuttingDown) {
        process.exit(1);
      }
    });

    // Track server connections
    let connectionCount = 0;
    server.on('connection', () => {
      connectionCount++;
      logger.debug(`New connection. Total: ${connectionCount}`);
    });

    server.on('close', () => {
      logger.info('Sunucu kapandi');
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      if (isShuttingDown) {
        logger.warn(`${signal} tekrar alindi, zaten kapatiliyor...`);
        return;
      }

      isShuttingDown = true;
      logger.info(`${signal} sinyali alindi. Temiz kapatma basliyor...`);
      logger.info(`Aktif baglanti sayisi: ${connectionCount}`);

      // Set a force shutdown timeout
      const forceShutdownTimer = setTimeout(() => {
        logger.error('Zorla kapatma zaman asimi (30 saniye)');
        logger.error('Tum baglantilar zorla kapatiliyor...');
        process.exit(1);
      }, 30000);

      try {
        // Close HTTP server
        if (server) {
          await new Promise<void>((resolve, reject) => {
            server!.close((err: Error | undefined) => {
              if (err) {
                logger.error('Sunucu kapatma hatasi:', err);
                reject(err);
              } else {
                logger.info('HTTP sunucusu kapatildi');
                resolve();
              }
            });
          });
        }

        // Close database connection
        await disconnectDatabase();
        logger.info('Veritabani baglantisi kapatildi');

        clearTimeout(forceShutdownTimer);
        logger.info('Sunucu basariyla kapatildi');
        process.exit(0);
      } catch (err: unknown) {
        clearTimeout(forceShutdownTimer);
        logger.error('Kapatma sirasinda hata:', err);
        process.exit(1);
      }
    };

    // Register shutdown handlers
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions with detailed logging
    process.on('uncaughtException', (error: Error) => {
      logger.error('='.repeat(50));
      logger.error('YAKALANMAMIS ISTISNA!');
      logger.error('='.repeat(50));
      logger.error(`Hata mesaji: ${error.message}`);
      logger.error(`Hata adi: ${error.name}`);
      logger.error(`Hata yigini: ${error.stack}`);

      if (isShuttingDown) {
        logger.warn('Kapatma sirasinda istisna, yoksayiliyor...');
        return;
      }

      // Log additional system info
      logger.error(`Bellek kullanimi: ${JSON.stringify(process.memoryUsage())}`);
      logger.error(`Platform: ${process.platform}`);
      logger.error(`Node versiyonu: ${process.version}`);

      // Don't exit immediately - try graceful shutdown first
      shutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('='.repeat(50));
      logger.error('ISLENMEMIS REDDETME!');
      logger.error('='.repeat(50));

      if (reason instanceof Error) {
        logger.error(`Hata mesaji: ${reason.message}`);
        logger.error(`Hata yigini: ${reason.stack}`);
      } else {
        logger.error(`Reddetme nedeni: ${JSON.stringify(reason)}`);
      }

      if (isShuttingDown) {
        logger.warn('Kapatma sirasinda reddetme, yoksayiliyor...');
        return;
      }
    });

    // Periodic health logging
    setInterval(() => {
      if (!isShuttingDown) {
        logger.debug(`Sunucu ayakta. Bellek: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
      }
    }, 60000); // Every minute

  } catch (error: unknown) {
    logger.error('='.repeat(50));
    logger.error('SUNUCU BASLATILAMADI!');
    logger.error('='.repeat(50));

    if (error instanceof Error) {
      logger.error(`Hata mesaji: ${error.message}`);
      logger.error(`Hata adi: ${error.name}`);
      logger.error(`Hata yigini: ${error.stack}`);

      // Common error detection with solutions
      const errorMsg = error.message.toLowerCase();

      if (errorMsg.includes('enoent') || errorMsg.includes('cannot find') || errorMsg.includes('modulenotfound')) {
        logger.error('');
        logger.error('Olası neden: Gerekli dosya veya modul bulunamiyor');
        logger.error('Cozum: `npm install` ve `npm run build` calistirin');
      } else if (errorMsg.includes('eaddrinuse')) {
        logger.error('');
        logger.error('Olası neden: Port zaten kullaniliyor');
        logger.error('Cozum: Port 3001\'i kullanan uygulamalari kapatin');
        logger.error('Kontrol: netstat -ano | findstr 3001');
      } else if (errorMsg.includes('prisma') || errorMsg.includes('database') || errorMsg.includes('sqlite')) {
        logger.error('');
        logger.error('Olası neden: Veritabani hatasi');
        logger.error('Cozumler:');
        logger.error('  1. `npx prisma generate` calistirin');
        logger.error('  2. `npx prisma db push` calistirin');
        logger.error('  3. Veritabani dosyasinin mevcut oldugunu kontrol edin');
      } else if (errorMsg.includes('eacces') || errorMsg.includes('permission')) {
        logger.error('');
        logger.error('Olası neden: Yetki hatasi');
        logger.error('Cozum: Yonetici olarak calistirin veya portu degistirin');
      }
    }

    logger.error('');
    logger.error('Detayli loglar icin: logs/ dizinine bakin');
    process.exit(1);
  }
}

// Start the application
main().catch((error: unknown) => {
  console.error('Fatal error starting application:', error);
  process.exit(1);
});