// utils/mlBridge.js — HTTP client to Python FastAPI ML microservice
const axios = require('axios');
const logger = require('./logger');

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://xai-thyroid-ml.onrender.com'
    : 'http://localhost:8000');

// Log at startup so we can verify in Render logs
console.log('[STARTUP] mlBridge loaded');
console.log('[STARTUP] ML_SERVICE_URL =', ML_SERVICE_URL);

const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 30000, // 30s — SHAP computation can be slow
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Run thyroid prediction via the Python ML service.
 * @param {Object} payload - { tsh, t3, tt4, fti, age, sex }
 * @returns {Promise<Object>} - { prediction, confidence, probabilities, shap_values }
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const formatMLServiceError = (error, targetUrl) => {
  if (error.response) {
    const msg = error.response.data?.detail || error.response.data?.message || 'ML service error';
    logger.error('ML service error response', {
      status: error.response.status,
      detail: msg,
      url: targetUrl,
    });
    return new Error(`ML service: ${msg}`);
  }

  if (error.code === 'ECONNREFUSED') {
    logger.error(`ML service connection refused at ${targetUrl} — is it running?`);
    return new Error(`ML service is not available at ${ML_SERVICE_URL}. Ensure ML_SERVICE_URL env var is set correctly.`);
  }

  if (error.code === 'ECONNABORTED') {
    logger.error(`ML service request timed out after 30s at ${targetUrl}`);
    return new Error('ML service request timed out. The prediction took too long.');
  }

  logger.error('ML service call failed', { error: error.message, code: error.code, url: targetUrl });
  return new Error(`Failed to reach ML service at ${ML_SERVICE_URL}: ${error.message}`);
};

async function callMLService(payload, retries = 3) {
  const targetUrl = `${ML_SERVICE_URL}/predict`;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    console.log('[mlBridge] Calling ML service:', targetUrl);
    console.log('[mlBridge] Prediction payload:', JSON.stringify(payload));

    try {
      const response = await mlClient.post('/predict', payload);
      console.log('[mlBridge] ML response status:', response.status);
      console.log('[mlBridge] ML response data:', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      const status = error.response?.status;

      console.error('[mlBridge] ML FULL ERROR:', {
        message: error.message,
        code: error.code,
        status,
        data: error.response?.data,
        url: targetUrl,
        ML_SERVICE_URL,
        attempt,
        retries,
      });

      const canRetry =
        attempt < retries &&
        (!error.response || status === 503 || status === 502 || status === 504);

      if (canRetry) {
        if (status === 503) {
          console.log(`ML service sleeping, retry ${attempt}/${retries}`);
        } else {
          console.log(`ML service call failed, retry ${attempt}/${retries}`);
        }
        await sleep(3000);
        continue;
      }

      if (status === 503) {
        throw new Error('ML service unavailable after retries');
      }

      throw formatMLServiceError(error, targetUrl);
    }
  }
}

async function getPrediction(payload) {
  return callMLService(payload);
}

/**
 * Health check for the ML service.
 */
async function checkMLHealth() {
  try {
    const response = await mlClient.get('/health', { timeout: 5000 });
    return response.data;
  } catch {
    return { status: 'unavailable', model_loaded: false, url: ML_SERVICE_URL };
  }
}

module.exports = { callMLService, getPrediction, checkMLHealth };
