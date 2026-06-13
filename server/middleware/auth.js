// middleware/auth.js — JWT verification middleware (OWASP A07:2021)
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Verifies JWT from Authorization: Bearer <token> header.
 * Attaches decoded user object to req.user.
 * Never exposes token or user enumeration details in error messages.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
      });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Session expired. Please log in again.' });
      }
      return res.status(401).json({ message: 'Invalid authentication token.' });
    }

    // Fetch user from DB to ensure they still exist
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'email', 'full_name', 'role', 'preferred_lang'],
    });

    if (!user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error('Auth middleware error', { error: err.message });
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = authMiddleware;
