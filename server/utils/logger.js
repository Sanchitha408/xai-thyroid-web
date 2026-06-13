// utils/logger.js — Winston structured logger with sensitive field masking
const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Fields that should NEVER appear in logs
const SENSITIVE_FIELDS = ['password', 'password_hash', 'token', 'authorization', 'jwt', 'secret', 'api_key'];

/**
 * Custom format: masks sensitive fields in log metadata.
 */
const maskSensitive = format((info) => {
  if (info.meta && typeof info.meta === 'object') {
    const masked = { ...info.meta };
    SENSITIVE_FIELDS.forEach((field) => {
      if (masked[field]) masked[field] = '***REDACTED***';
    });
    info.meta = masked;
  }
  return info;
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    maskSensitive(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    new transports.File({
      filename: path.join(logsDir, 'app.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
    }),
  ],
});

// In development, also log to console in a readable format
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
    })
  );
}

module.exports = logger;
