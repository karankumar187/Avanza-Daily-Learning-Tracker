const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const moment = require('moment-timezone');
const passport = require('passport');
const session = require('express-session');

// Security packages
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

// Load env variables in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Import DB connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const learningObjectiveRoutes = require('./routes/learningObjectives');
const progressRoutes = require('./routes/progress');
const scheduleRoutes = require('./routes/schedules');
const analyticsRoutes = require('./routes/analytics');
const aiAssistantRoutes = require('./routes/aiAssistant');
const feedbackRoutes = require('./routes/feedback');
const noteRoutes = require('./routes/notes');
const notificationRoutes = require('./routes/notifications');
const cronRoutes = require('./routes/cron');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import models for cron jobs
const DailyProgress = require('./models/DailyProgress');
const Schedule = require('./models/Schedule');
const Notification = require('./models/Notification');
const User = require('./models/User');
const LearningObjective = require('./models/LearningObjective');

const app = express();

// Middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Guard: crash loudly if session secret is missing in production
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET && !process.env.JWT_SECRET) {
  console.error('FATAL: SESSION_SECRET or JWT_SECRET env var is required in production.');
  process.exit(1);
}

// Express Session
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Set security HTTP headers
app.use(helmet());

// Sanitize data against NoSQL Query Injection
app.use(mongoSanitize());

// Sanitize data against XSS
app.use(xss());

// Prevent HTTP Param Pollution
app.use(hpp());

// Global rate limit: 500 requests per 10 minutes
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again in 10 minutes.' }
});
app.use('/api', limiter);

// Stricter rate limit for auth endpoints: 10 attempts per 15 minutes (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' },
  skipSuccessfulRequests: true // only count failed requests
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Ensure database is connected for serverless functions
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection failed in middleware:', err);
    next(err);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/objectives', learningObjectiveRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiAssistantRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cron', cronRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    timezone: 'UTC (IST)'
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Learning Management System API',
    version: '1.0.0'
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorHandler);

/* =========================
   START SERVER PROPERLY
========================= */

const PORT = process.env.PORT || 5000;

// Export app for serverless execution (e.g. Netlify)
module.exports = app;

// If the file is run directly (not imported as a module), start the local server
if (require.main === module) {
  connectDB()
    .then(() => {
      console.log('Database connected');

      // Setup Passport strategies
      require('./config/passportConfig')();

      const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });

      // Handle unhandled rejections safely
      process.on('unhandledRejection', (err) => {
        console.error('UNHANDLED REJECTION! 💥 Shutting down...');
        console.error(err.name, err.message);

        server.close(() => {
          process.exit(1);
        });
      });
    })
    .catch((err) => {
      console.error('Database connection failed:', err);
      process.exit(1);
    });
}