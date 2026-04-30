const moment = require('moment-timezone');
const DailyProgress = require('../models/DailyProgress');
const Schedule = require('../models/Schedule');
const Notification = require('../models/Notification');
const User = require('../models/User');
const syncProgress = require('../utils/syncProgress');

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

// @desc    Execute hourly cron tasks
// @route   POST /api/cron/hourly
// @access  Private (Cron secret)
exports.executeHourlyTasks = async (req, res, next) => {
  try {
    // Basic protection (optional but recommended if triggering from external service)
    const cronSecret = req.headers['x-cron-secret'] || req.query.secret;
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({ success: false, message: 'Unauthorized cron trigger' });
    }

    console.log('Running hourly cron tasks endpoint...');
    const users = await User.find({});

    for (const user of users) {
      const userTz = user.timezone || 'UTC';
      const userNow = moment.tz(userTz);
      const userHour = userNow.hour();

      // 1. Auto-mark missed progress (11:59 PM)
      if (userHour === 23) {
        try {
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
        } catch (error) {
          console.error(`Error auto-marking missed for user ${user._id}:`, error);
        }
      }

      // 2. Create daily progress dynamically (12:xx AM - 1:xx AM)
      if (userHour === 0) {
        try {
          await syncProgress(user._id, userTz, 2);
          console.log(`Synced progress for user ${user._id} in timezone ${userTz}`);
        } catch (error) {
          console.error(`Error syncing progress for user ${user._id}:`, error);
        }
      }

      // 3. Incomplete task reminder (5:xx PM or 10:xx PM)
      if (userHour === 17) {
        try {
          await sendIncompleteTaskReminderForUser(user, 'evening');
        } catch (error) {
          console.error(`Error sending evening reminder to ${user._id}:`, error);
        }
      } else if (userHour === 22) {
        try {
          await sendIncompleteTaskReminderForUser(user, 'night');
        } catch (error) {
          console.error(`Error sending night reminder to ${user._id}:`, error);
        }
      }

      // 4. Weekly motivation (Monday 9:00 AM)
      if (userNow.day() === 1 && userHour === 9) {
        try {
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
        } catch (error) {
          console.error(`Error sending weekly motivation to ${user._id}:`, error);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Hourly cron tasks executed successfully'
    });
  } catch (error) {
    console.error('Error executing hourly cron tasks:', error);
    next(error);
  }
};
