// utils/logger.js — Client-side logger interface
const isProd = import.meta.env.PROD;

const logger = {
  info: (msg, meta) => {
    if (!isProd) {
      console.log(`[INFO] ${msg}`, meta || '');
    }
  },
  warn: (msg, meta) => {
    console.warn(`[WARN] ${msg}`, meta || '');
  },
  error: (msg, meta) => {
    console.error(`[ERROR] ${msg}`, meta || '');
  },
};

export default logger;
