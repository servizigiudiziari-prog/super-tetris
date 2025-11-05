import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import healthRouter from './routes/health';
import logger from './utils/logger';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.api.corsOrigin,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Rate limiting (apply to all routes except health checks)
app.use('/api', apiLimiter);

// Routes
app.use('/api', healthRouter);

// TODO: Add more routes
// app.use('/api/auth', authRouter);
// app.use('/api/games', gameRouter);
// app.use('/api/notifications', notificationRouter);
// app.use('/api/analytics', analyticsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Tetris Cooperativo Asincrono API',
    version: '0.1.0',
    status: 'running',
    documentation: '/api/docs',
  });
});

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
