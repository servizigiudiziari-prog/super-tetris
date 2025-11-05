import { Pool, PoolClient } from 'pg';
import config from './env';
import logger from '../utils/logger';

class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Pool error handler
    this.pool.on('error', (err) => {
      logger.error('Unexpected database pool error', { error: err });
    });

    // Test connection on startup
    this.testConnection();
  }

  private async testConnection(): Promise<void> {
    try {
      const client = await this.pool.connect();
      logger.info('Database connection established successfully');
      client.release();
    } catch (err) {
      logger.error('Failed to connect to database', { error: err });
      throw err;
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;

      if (duration > 100) {
        logger.warn('Slow query detected', { duration, query: text });
      }

      return result;
    } catch (err) {
      logger.error('Database query error', {
        error: err,
        query: text,
        params
      });
      throw err;
    }
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('Transaction rolled back', { error: err });
      throw err;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
    logger.info('Database pool closed');
  }
}

export default new Database();
