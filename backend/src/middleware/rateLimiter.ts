import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import config from '../config/env';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.rateLimit.apiCallsPerHour,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Move submission rate limiter (stricter)
export const moveLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.rateLimit.movesPerMinute,
  message: 'Too many moves submitted, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Rate limit per user, not per IP
    return (req as any).user?.id || req.ip;
  },
});

// Auth endpoints rate limiter (prevent brute force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
