// routes/chatRoutes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const { chatLimiter } = require('../middleware/rateLimiter');

// POST /api/v1/chat/message
router.post(
  '/message',
  authMiddleware,
  chatLimiter,
  [
    body('message')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Message must be 1–1000 characters.')
      .escape(),
    body('session_id').optional().isUUID().withMessage('Invalid session ID.'),
    body('language')
      .optional()
      .isIn(['en', 'hi', 'kn', 'ta', 'fr', 'es'])
      .withMessage('Unsupported language.'),
  ],
  validate,
  chatController.sendMessage
);

// GET /api/v1/chat/sessions
router.get('/sessions', authMiddleware, chatController.getSessions);

module.exports = router;
