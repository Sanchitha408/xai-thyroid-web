// middleware/errorHandler.js — Global error handler (OWASP: never expose stack traces)
const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  // Log full error server-side
  logger.error('Unhandled error', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({
      message: 'Data validation error',
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  // Sequelize unique constraint (e.g. duplicate email)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'field';
    return res.status(409).json({ message: `${field} already exists.` });
  }

  // CORS error
  if (err.message && err.message.startsWith('CORS blocked')) {
    return res.status(403).json({ message: 'Forbidden.' });
  }

  // Generic — NEVER send stack traces to client
  return res.status(statusCode).json({
    message:
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred.'
        : err.message || 'An unexpected error occurred.',
  });
};

module.exports = errorHandler;
