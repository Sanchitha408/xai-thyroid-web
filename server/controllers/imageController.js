// controllers/imageController.js — Forward image to ML service for analysis
const logger = require('../utils/logger');

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://xai-thyroid-ml.onrender.com'
    : 'http://localhost:8000');

exports.analyzeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    const { method, stage, threshold } = req.body;

    // Use native FormData & Blob (supported in modern Node.js) to build request body
    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    
    formData.append('image', blob, req.file.originalname);
    formData.append('method', method || 'GradCAM');
    formData.append('stage', stage || 'second_stage');
    formData.append('threshold', threshold || '0.5');

    logger.info('Forwarding ultrasound image to ML service', {
      filename: req.file.originalname,
      size: req.file.size,
      method,
      stage,
      threshold,
    });

    const mlResponse = await fetch(`${ML_SERVICE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      logger.error('ML service returned error for image analysis', {
        status: mlResponse.status,
        error: errorText,
      });
      return res.status(mlResponse.status).json({
        message: `ML service error: ${errorText || mlResponse.statusText}`,
      });
    }

    const result = await mlResponse.json();
    return res.status(200).json(result);
  } catch (err) {
    logger.error('Image analysis error in controller', { error: err.message, stack: err.stack });
    next(err);
  }
};
