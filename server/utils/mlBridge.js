// utils/mlBridge.js — HTTP client to Python FastAPI ML microservice
const axios = require('axios');
const logger = require('./logger');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

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
  try {
    logger.info('Calling ML service /predict', { payload: { ...payload } });
    const response = await mlClient.post('/predict', payload);
    return response.data;
  } catch (error) {
    if (error.response) {
      // ML service returned an error response
      const msg = error.response.data?.detail || 'ML service error';
      logger.error('ML service error response', {
        status: error.response.status,
        detail: msg,
      });
      throw new Error(`ML service: ${msg}`);
    } else if (error.code === 'ECONNREFUSED') {
      logger.error('ML service connection refused — is it running on port 8000?');
      throw new Error('ML service is not available. Please ensure the Python service is running.');
    } else {
      logger.error('ML service call failed', { error: error.message });
      throw new Error('Failed to reach ML service');
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
    return { status: 'unavailable', model_loaded: false };
  }
}

module.exports = { getPrediction, checkMLHealth };
