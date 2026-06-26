// middleware/auth.js — JWT verification middleware (OWASP A07:2021)
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || 
                       req.headers.Authorization;
    
    console.log('Auth header received:', authHeader ? 
      authHeader.substring(0, 30) + '...' : 'MISSING');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Authentication required.' 
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: 'Authentication required.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ 
      message: 'Invalid authentication token.' 
    });
  }
};
