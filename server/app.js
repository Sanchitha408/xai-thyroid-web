// app.js — Express application setup with full OWASP security stack
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
require('./config/passport');

const corsOptions = require('./config/corsOptions');
const { globalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Route imports
const authRoutes = require('./routes/authRoutes');
const diagnosisRoutes = require('./routes/diagnosisRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reportRoutes = require('./routes/reportRoutes');
const imageRoutes = require('./routes/imageRoutes');

const app = express();


// ─── OWASP Security Headers (A05:2021) ─────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
  })
);

// Remove X-Powered-By (OWASP A05)
app.disable('x-powered-by');

// ─── CORS ───────────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'XAI Thyroid Backend',
    uptime: process.uptime()
  });
});


// ─── Body Parsing ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// ─── HTTP Logging (morgan → winston) ────────────────────────────────────────────
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
    // Skip logging health checks to reduce noise
    skip: (req) => req.url === '/health',
  })
);

// ─── Global Rate Limiter (OWASP A04:2021) ───────────────────────────────────────
app.use(globalLimiter);

// ─── Health Check ────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET || 'xai-thyroid-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// ─── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/diagnosis', diagnosisRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/report', reportRoutes);
app.use('/api/v1/image', imageRoutes);


// ─── 404 Handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found.' });
});

// ─── Global Error Handler (must be last) ────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
