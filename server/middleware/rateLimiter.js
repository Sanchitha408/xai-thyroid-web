// middleware/rateLimiter.js — Per-route rate limiters (OWASP A04:2021)
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const onLimitReached = (req, res, options) => {
  logger.warn('Rate limit hit', {
    ip: req.ip,
    path: req.path,
    limit: options.max,
  });
};

/** Global limiter — applied to all routes */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
  handler: (req, res, next, options) => {
    onLimitReached(req, res, options);
    res.status(429).json(options.message);
  },
});

/** Auth routes — strict (prevents brute force on login/register) */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Try again in 15 minutes.' },
  handler: (req, res, next, options) => {
    onLimitReached(req, res, options);
    res.status(429).json(options.message);
  },
});

/** Predict route — per user (user-based key via JWT user id) */
const predictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip, // Use user ID after auth
  message: { message: 'Diagnosis limit reached. You can run 30 predictions per hour.' },
  handler: (req, res, next, options) => {
    onLimitReached(req, res, options);
    res.status(429).json(options.message);
  },
});

/** Chat route — per user, short window */
const chatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { message: 'Message limit reached. Please wait a few minutes.' },
  handler: (req, res, next, options) => {
    onLimitReached(req, res, options);
    res.status(429).json(options.message);
  },
});

module.exports = { globalLimiter, authLimiter, predictLimiter, chatLimiter };
