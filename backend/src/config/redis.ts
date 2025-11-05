import { createClient, RedisClientType } from 'redis';
import config from './env';
import logger from '../utils/logger';

class RedisClient {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: config.redis.url,
    });

    // Event handlers
    this.client.on('error', (err) => {
      logger.error('Redis client error', { error: err });
    });

    this.client.on('connect', () => {
      logger.info('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      logger.warn('Redis client disconnected');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  // Cache game state
  async cacheGameState(gameId: string, state: any, ttl: number = 3600): Promise<void> {
    const key = `game:${gameId}:state`;
    await this.client.setEx(key, ttl, JSON.stringify(state));
  }

  async getGameState(gameId: string): Promise<any | null> {
    const key = `game:${gameId}:state`;
    const cached = await this.client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async invalidateGameState(gameId: string): Promise<void> {
    const key = `game:${gameId}:state`;
    await this.client.del(key);
  }

  // Session management
  async setSession(userId: string, sessionData: any, ttl: number = 604800): Promise<void> {
    const key = `session:${userId}`;
    await this.client.setEx(key, ttl, JSON.stringify(sessionData));
  }

  async getSession(userId: string): Promise<any | null> {
    const key = `session:${userId}`;
    const cached = await this.client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async deleteSession(userId: string): Promise<void> {
    const key = `session:${userId}`;
    await this.client.del(key);
  }

  // Rate limiting
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const current = await this.client.incr(key);

    if (current === 1) {
      await this.client.expire(key, windowSeconds);
    }

    return current <= limit;
  }

  // Generic cache operations
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  getClient(): RedisClientType {
    return this.client;
  }
}

export default new RedisClient();
