// routes/imageRoutes.js — Ultrasound image XAI analysis routes
const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const imageController = require('../controllers/imageController');
const { imageLimiter } = require('../middleware/rateLimiter');

// Configure multer for in-memory image upload (never persisted to disk for privacy)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// POST /api/v1/image/analyze
router.post(
  '/analyze',
  authMiddleware,
  imageLimiter,
  upload.single('image'),
  imageController.analyzeImage
);

module.exports = router;
