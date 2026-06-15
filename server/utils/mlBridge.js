// utils/mlBridge.js — HTTP client to Python FastAPI ML microservice
const axios = require('axios');
const logger = require('./logger');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

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
async function getPrediction(payload) {
  const targetUrl = `${ML_SERVICE_URL}/predict`;
  console.log('[mlBridge] Calling ML service:', targetUrl);
  console.log('[mlBridge] Prediction payload:', JSON.stringify(payload));

  try {
    const response = await mlClient.post('/predict', payload);
    console.log('[mlBridge] ML response status:', response.status);
    console.log('[mlBridge] ML response data:', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    // Comprehensive error logging
    console.error('[mlBridge] ML FULL ERROR:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
      url: targetUrl,
      ML_SERVICE_URL,
    });

    if (error.response) {
      // ML service returned an error response
      const msg = error.response.data?.detail || 'ML service error';
      logger.error('ML service error response', {
        status: error.response.status,
        detail: msg,
        url: targetUrl,
      });
      throw new Error(`ML service: ${msg}`);
    } else if (error.code === 'ECONNREFUSED') {
      logger.error(`ML service connection refused at ${targetUrl} — is it running?`);
      throw new Error(`ML service is not available at ${ML_SERVICE_URL}. Ensure ML_SERVICE_URL env var is set correctly.`);
    } else if (error.code === 'ECONNABORTED') {
      logger.error(`ML service request timed out after 30s at ${targetUrl}`);
      throw new Error('ML service request timed out. The prediction took too long.');
    } else {
      logger.error('ML service call failed', { error: error.message, code: error.code, url: targetUrl });
      throw new Error(`Failed to reach ML service at ${ML_SERVICE_URL}: ${error.message}`);
    }
  }
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

module.exports = { getPrediction, checkMLHealth };
