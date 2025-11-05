import app from './app';
import config from './config/env';
import database from './config/database';
import redis from './config/redis';
import logger from './utils/logger';

const PORT = config.port;

async function startServer() {
  try {
    // Connect to Redis
    await redis.connect();
    logger.info('Redis connected successfully');

    // Database connection is already initialized in database.ts

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${config.env} mode`);
      logger.info(`API Base URL: ${config.api.baseUrl}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await database.close();
          logger.info('Database connection closed');

          await redis.disconnect();
          logger.info('Redis connection closed');

          process.exit(0);
        } catch (err) {
          logger.error('Error during graceful shutdown', { error: err });
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught exception', { error: err });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', { reason, promise });
      process.exit(1);
    });

  } catch (err) {
    logger.error('Failed to start server', { error: err });
    process.exit(1);
  }
}

// Start the server
startServer();
