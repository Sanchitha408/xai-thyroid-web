// server.js — Start server after DB connection established
require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Authenticate and sync DB connection (does NOT run migrations)
    await sequelize.authenticate();
    logger.info('PostgreSQL connection established.');

    // In development, auto-sync schema (use migrations in production)
    if (process.env.NODE_ENV === 'development') {
  await sequelize.sync({ alter: false });
  logger.info('Sequelize sync complete (development mode).');
    }

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
