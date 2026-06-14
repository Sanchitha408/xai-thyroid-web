// routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

// Password complexity: min 8 chars, 1 uppercase, 1 number, 1 special char
const passwordValidator = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters.')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter.')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number.')
  .matches(/[!@#$%^&*(),.?":{}|<>_\-+=~`]/)
  .withMessage('Password must contain at least one special character.');

// POST /api/v1/auth/register
router.post(
  '/register',
  authLimiter,
  [
    body('full_name')
      .trim()
      .escape()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be 2–100 characters.'),
    body('email')
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage('Please provide a valid email address.'),
    passwordValidator,
    body('preferred_lang')
      .optional()
      .isIn(['en', 'hi', 'kn', 'ta', 'fr', 'es'])
      .withMessage('Unsupported language code.'),
  ],
  validate,
  authController.register
);

// POST /api/v1/auth/login
router.post(
  '/login',
  authLimiter,
  [
    body('email').trim().normalizeEmail().isEmail().withMessage('Valid email required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  authController.login
);

// POST /api/v1/auth/logout (protected)
router.post('/logout', authMiddleware, authController.logout);

// GET /api/v1/auth/me (protected)
router.get('/me', authMiddleware, authController.getMe);

// PATCH /api/v1/auth/language (protected)
router.patch(
  '/language',
  authMiddleware,
  [body('lang').isIn(['en', 'hi', 'kn', 'ta', 'fr', 'es']).withMessage('Invalid language code.')],
  validate,
  authController.updateLanguage
);

// ─── Google OAuth Routes ────────────────────────────────────────────────────────
const jwt = require('jsonwebtoken');

router.get('/auth/google',
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ 
        message: 'Google OAuth not configured on server.' 
      });
    }
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: process.env.FRONTEND_URL + '/auth?error=google_failed',
    session: false
  }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      res.redirect(
        process.env.FRONTEND_URL + '/auth/google/success?token=' + token
      );
    } catch (err) {
      console.error('JWT signing error:', err);
      res.redirect(process.env.FRONTEND_URL + '/auth?error=google_failed');
    }
  }
);

// Alias routes to support both /api/v1/auth/google and /api/v1/auth/auth/google
router.get('/google',
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ 
        message: 'Google OAuth not configured on server.' 
      });
    }
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: process.env.FRONTEND_URL + '/auth?error=google_failed',
    session: false
  }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      res.redirect(
        process.env.FRONTEND_URL + '/auth/google/success?token=' + token
      );
    } catch (err) {
      console.error('JWT signing error:', err);
      res.redirect(process.env.FRONTEND_URL + '/auth?error=google_failed');
    }
  }
);

module.exports = router;
