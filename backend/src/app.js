const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const env = require('./config/env');
const apiRoutes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');
const { apiRateLimiter } = require('./middlewares/rateLimit.middleware');

const app = express();

// Security Headers
app.use(helmet());

// Cookie Parser (for HttpOnly refresh tokens)
app.use(cookieParser());

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || env.CORS_ORIGINS.includes(origin) || env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Request Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Global Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Rate Limiting
app.use('/api', apiRateLimiter);

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Master API v1 Route Mount
app.use('/api/v1', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Rentora Multi-Vendor Rental REST API',
    version: '1.0.0',
    status: 'Running',
    docs: '/api/v1/health'
  });
});

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route '${req.originalUrl}' not found on Rentora backend server`,
    data: null,
    errors: { route: 'Not Found' }
  });
});

// Centralized Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
