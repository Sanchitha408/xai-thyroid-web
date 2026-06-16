// server.js — Start server after DB connection established
require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const logger = require('./utils/logger');
const https = require('https');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Authenticate and sync DB connection (does NOT run migrations)
    await sequelize.authenticate();
    logger.info('PostgreSQL connection established.');

    // In development, auto-sync schema (use migrations in production)
  await sequelize.sync({ alter: false });
  logger.info('Sequelize sync complet.');

    app.listen(PORT, () => {
      logger.info(`XAI Thyroid server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received — closing DB connections');
  await sequelize.close();
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: String(reason) });
});

startServer();

const trimTrailingSlash = (url) => url.replace(/\/+$/, '');

const pingUrl = (url, label) => {
  https.get(url, (res) => {
    logger.info(`${label} keep-alive ping sent`, { status: res.statusCode });
    res.resume();
  }).on('error', (err) => {
    logger.warn(`${label} keep-alive ping failed`, { error: err.message });
  });
};

// Keep-alive pings to reduce Render free tier sleep
if (process.env.NODE_ENV === 'production') {
  const backendBaseUrl = trimTrailingSlash(
    process.env.RENDER_EXTERNAL_URL ||
    'https://xai-thyroid-backend.onrender.com'
  );
  const mlServiceUrl = trimTrailingSlash(
    process.env.ML_SERVICE_URL ||
    'https://xai-thyroid-ml.onrender.com'
  );

  setInterval(() => {
    pingUrl(`${backendBaseUrl}/api/v1/health`, 'Backend');
  }, 14 * 60 * 1000);

  setInterval(() => {
    pingUrl(`${mlServiceUrl}/health`, 'ML service');
  }, 14 * 60 * 1000);
}
