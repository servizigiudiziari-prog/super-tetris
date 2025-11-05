import { Router, Request, Response } from 'express';
import database from '../config/database';
import redis from '../config/redis';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await database.query('SELECT 1');

    // Check Redis connection
    await redis.set('health-check', 'ok', 10);

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
      },
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

router.get('/health/ready', async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});

router.get('/health/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

export default router;
