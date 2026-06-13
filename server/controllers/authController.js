// controllers/authController.js — Register, Login, Logout, GetMe, UpdateLanguage
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

const SALT_ROUNDS = 12;
const GENERIC_AUTH_ERROR = 'Invalid email or password.'; // OWASP: no user enumeration

/** Sign a JWT for a user */
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.signToken = signToken;

// ─── POST /api/v1/auth/register ────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { full_name, email, password, preferred_lang = 'en' } = req.body;

    // Check for existing user
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      // OWASP A07: Don't reveal if email exists in timing-safe way
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      preferred_lang,
      role: 'patient',
    });

    const token = signToken(user.id);

    logger.info('User registered', { userId: user.id, role: user.role });

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        preferred_lang: user.preferred_lang,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/auth/login ────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    // Constant-time comparison even when user not found (prevent timing attacks)
    const dummyHash = '$2a$12$invalid.hash.for.timing.safety.padding.xxxxxyz';
    const isMatch = user
      ? await bcrypt.compare(password, user.password_hash)
      : await bcrypt.compare(password, dummyHash).then(() => false);

    if (!user || !isMatch) {
      // OWASP A07: ~300ms delay on failure to slow brute force
      await new Promise((r) => setTimeout(r, 300));
      logger.warn('Failed login attempt', { email: email.toLowerCase() });
      return res.status(401).json({ message: GENERIC_AUTH_ERROR });
    }

    const token = signToken(user.id);
    logger.info('User logged in', { userId: user.id });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        preferred_lang: user.preferred_lang,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/auth/logout ───────────────────────────────────────────────────
exports.logout = (req, res) => {
  logger.info('User logged out', { userId: req.user?.id });
  // Client-side token removal — no server-side blacklist for MVP
  return res.status(200).json({ message: 'Logged out successfully.' });
};

// ─── GET /api/v1/auth/me ────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'full_name', 'role', 'preferred_lang', 'created_at'],
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/v1/auth/language ───────────────────────────────────────────────
exports.updateLanguage = async (req, res, next) => {
  try {
    const { lang } = req.body;
    const allowed = ['en', 'hi', 'kn', 'ta', 'fr', 'es'];
    if (!allowed.includes(lang)) {
      return res.status(400).json({ message: 'Unsupported language code.' });
    }
    await User.update({ preferred_lang: lang }, { where: { id: req.user.id } });
    return res.status(200).json({ message: 'Language updated.', lang });
  } catch (err) {
    next(err);
  }
};
