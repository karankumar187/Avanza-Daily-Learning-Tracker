const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
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
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

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

    /* =========================
       CRON JOBS
    ========================= */

    // Auto-mark missed progress dynamically (runs hourly, checks if it's 11:59 PM in user's timezone)
    cron.schedule('59 * * * *', async () => {
      console.log('Running dynamic auto-mark missed progress cron job...');
      try {
        const users = await User.find({});
        for (const user of users) {
          const userTz = user.timezone || 'UTC';
          const userNow = moment.tz(userTz);
          
          if (userNow.hour() === 23) {
            const yesterday = moment.tz(userTz).subtract(1, 'day').startOf('day').toDate();
            const endOfYesterday = moment.tz(userTz).subtract(1, 'day').endOf('day').toDate();

            await DailyProgress.updateMany(
              {
                user: user._id,
                date: { $gte: yesterday, $lte: endOfYesterday },
                status: 'pending'
              },
              {
                status: 'missed',
                updatedAt: Date.now()
              }
            );
          }
        }
      } catch (error) {
        console.error('Error in dynamic auto-mark cron job:', error);
      }
    });

    // Create daily progress dynamically for each user (runs hourly, triggers shortly after user's local midnight)
    cron.schedule('5 * * * *', async () => {
      console.log('Running dynamic hourly daily progress creation cron job...');
      try {
        const users = await User.find({});
        for (const user of users) {
          const userTz = user.timezone || 'UTC';
          const userNow = moment.tz(userTz);
          
          // If it's between 12:00 AM and 1:00 AM in the user's timezone, generate their daily progress
          if (userNow.hour() === 0) {
            const syncProgress = require('./utils/syncProgress');
            await syncProgress(user._id, userTz, 2);
            console.log(`Synced progress for user ${user._id} in timezone ${userTz}`);
          }
        }
      } catch (error) {
        console.error('Error in dynamic daily progress cron job:', error);
      }
    });

    // Incomplete task reminder hourly check
    cron.schedule('0 * * * *', async () => {
      console.log('Running hourly incomplete task reminder check...');
      try {
        const users = await User.find({});
        for (const user of users) {
          const userTz = user.timezone || 'UTC';
          const userHour = moment.tz(userTz).hour();
          
          if (userHour === 17) {
            await sendIncompleteTaskReminderForUser(user, 'evening');
          } else if (userHour === 22) {
            await sendIncompleteTaskReminderForUser(user, 'night');
          }
        }
      } catch (error) {
        console.error('Error in dynamic reminder cron:', error);
      }
    });

    // Weekly motivation (Hourly check, runs Monday 9:00 AM user local time)
    cron.schedule('0 * * * *', async () => {
      console.log('Checking weekly motivation notifications...');
      try {
        const users = await User.find({});
        for (const user of users) {
          const userTz = user.timezone || 'UTC';
          const userNow = moment.tz(userTz);
          
          if (userNow.day() === 1 && userNow.hour() === 9) { // Monday 9 AM
            const weekAgo = moment.tz(userTz).subtract(7, 'days').startOf('day').toDate();
            const now = moment.tz(userTz).endOf('day').toDate();
            
            const completedLastWeek = await DailyProgress.countDocuments({
              user: user._id,
              status: 'completed',
              date: { $gte: weekAgo, $lte: now }
            });

            if (completedLastWeek > 0) {
              await Notification.create({
                user: user._id,
                title: 'Weekly Summary',
                message: `Last week you completed ${completedLastWeek} tasks. Let's make this week even better!`,
                type: 'info'
              });
            } else {
              await Notification.create({
                user: user._id,
                title: 'New Week, Fresh Start!',
                message: 'A new week begins! Set your learning goals and start building momentum.',
                type: 'info'
              });
            }
          }
        }
      } catch (error) {
        console.error('Error in weekly motivation cron:', error);
      }
    });

    console.log('Cron jobs scheduled successfully.');
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

// Helper: Send incomplete task reminders for a specific user
async function sendIncompleteTaskReminderForUser(user, timeOfDay) {
  const userTz = user.timezone || 'UTC';
  const todayStart = moment.tz(userTz).startOf('day').toDate();
  const todayEnd = moment.tz(userTz).endOf('day').toDate();

  const pendingEntries = await DailyProgress.find({
    user: user._id,
    date: { $gte: todayStart, $lte: todayEnd },
    status: 'pending'
  }).populate('learningObjective', 'title');

  if (pendingEntries.length === 0) return;

  const tasks = pendingEntries.map(entry => entry.learningObjective?.title || 'Unnamed task');
  const taskCount = tasks.length;
  const taskList = tasks.slice(0, 3).join(', ');
  const extra = taskCount > 3 ? ` and ${taskCount - 3} more` : '';

  const title = timeOfDay === 'evening'
    ? 'Evening Reminder'
    : 'Late Night Reminder';

  const message = timeOfDay === 'evening'
    ? `You still have ${taskCount} pending task${taskCount > 1 ? 's' : ''}: ${taskList}${extra}. Complete them before the day ends!`
    : `Don't forget! ${taskCount} task${taskCount > 1 ? 's are' : ' is'} still pending: ${taskList}${extra}. Wrap up before midnight!`;

  await Notification.create({
    user: user._id,
    title,
    message,
    type: 'warning'
  });
  
  console.log(`Sent ${timeOfDay} reminder to user ${user._id}`);
}