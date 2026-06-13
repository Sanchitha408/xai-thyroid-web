// routes/reportRoutes.js
const express = require('express');
const { param } = require('express-validator');
const router = express.Router();

const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

// GET /api/v1/report/download/:record_id
router.get(
  '/download/:record_id',
  authMiddleware,
  [param('record_id').isUUID().withMessage('Invalid record ID.')],
  validate,
  reportController.downloadRecord
);

module.exports = router;
