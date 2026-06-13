// routes/diagnosisRoutes.js
const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const diagnosisController = require('../controllers/diagnosisController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const { predictLimiter } = require('../middleware/rateLimiter');

// POST /api/v1/diagnosis/predict
router.post(
  '/predict',
  authMiddleware,
  predictLimiter,
  [
    body('tsh').isFloat({ min: 0, max: 30 }).withMessage('TSH must be a number between 0 and 30.'),
    body('t3').isFloat({ min: 0, max: 15 }).withMessage('T3 must be a number between 0 and 15.'),
    body('tt4')
      .isFloat({ min: 0, max: 300 })
      .withMessage('TT4 must be a number between 0 and 300.'),
    body('fti')
      .isFloat({ min: 0, max: 400 })
      .withMessage('FTI must be a number between 0 and 400.'),
    body('age').isInt({ min: 1, max: 120 }).withMessage('Age must be an integer between 1 and 120.'),
    body('sex').isIn(['Male', 'Female']).withMessage('Sex must be Male or Female.'),
  ],
  validate,
  diagnosisController.predict
);

// GET /api/v1/diagnosis/history
router.get(
  '/history',
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1–50.'),
  ],
  validate,
  diagnosisController.getHistory
);

// GET /api/v1/diagnosis/history/:id
router.get(
  '/history/:id',
  authMiddleware,
  [param('id').isUUID().withMessage('Invalid record ID.')],
  validate,
  diagnosisController.getRecord
);

// DELETE /api/v1/diagnosis/history/:id
router.delete(
  '/history/:id',
  authMiddleware,
  [param('id').isUUID().withMessage('Invalid record ID.')],
  validate,
  diagnosisController.deleteRecord
);

module.exports = router;
