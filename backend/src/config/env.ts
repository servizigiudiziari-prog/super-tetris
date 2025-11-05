import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  env: string;
  port: number;
  database: {
    url: string;
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  redis: {
    url: string;
    host: string;
    port: number;
  };
  jwt: {
    secret: string;
    expiration: string;
    refreshExpiration: string;
  };
  api: {
    baseUrl: string;
    corsOrigin: string;
  };
  rateLimit: {
    movesPerMinute: number;
    apiCallsPerHour: number;
  };
  game: {
    defaultTargetLines: number;
    defaultDurationHours: number;
    maxMoveTimeSeconds: number;
  };
  analytics: {
    enabled: boolean;
  };
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  database: {
    url: process.env.DATABASE_URL || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'tetris',
    password: process.env.DB_PASSWORD || 'tetris_dev_password',
    database: process.env.DB_NAME || 'tetris_coop',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiration: process.env.JWT_EXPIRATION || '7d',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '30d',
  },

  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:19006',
  },

  rateLimit: {
    movesPerMinute: parseInt(process.env.RATE_LIMIT_MOVES_PER_MINUTE || '10', 10),
    apiCallsPerHour: parseInt(process.env.RATE_LIMIT_API_CALLS_PER_HOUR || '1000', 10),
  },

  game: {
    defaultTargetLines: parseInt(process.env.DEFAULT_TARGET_LINES || '100', 10),
    defaultDurationHours: parseInt(process.env.DEFAULT_GAME_DURATION_HOURS || '24', 10),
    maxMoveTimeSeconds: parseInt(process.env.MAX_MOVE_TIME_SECONDS || '60', 10),
  },

  analytics: {
    enabled: process.env.ENABLE_ANALYTICS === 'true',
  },
};

// Validation
if (config.env === 'production' && config.jwt.secret === 'dev-secret-change-in-production') {
  throw new Error('JWT_SECRET must be set in production');
}

export default config;
