const mongoose = require('/Users/karankumar/Documents/Projects/LearnFlow/server/node_modules/mongoose');
const DailyProgress = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/DailyProgress');
const Schedule = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/Schedule');
const User = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/User');
const LearningObjective = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/LearningObjective');
const moment = require('/Users/karankumar/Documents/Projects/LearnFlow/server/node_modules/moment-timezone');

async function getWeeklyChartData(userId, userTz) {
  const now = moment.tz(userTz);
  const startOfWeek = now.clone().startOf('week');
  const endOfWeek = now.clone().endOf('week');

  const progress = await DailyProgress.find({
    user: userId,
    date: {
      $gte: startOfWeek.toDate(),
      $lte: endOfWeek.toDate()
    }
  });

  const schedule = await Schedule.findOne({
    user: userId,
    isDefault: true,
    isActive: true
  });

  const weekDaysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const chartData = days.map((day, index) => {
    const dayStart = startOfWeek.clone().add(index, 'days').startOf('day');
    const dayEnd = startOfWeek.clone().add(index, 'days').endOf('day');

    const dayProgress = progress.filter(p => {
      const pDate = moment.tz(p.date, userTz);
      return pDate.isBetween(dayStart, dayEnd, null, '[]');
    });

    let dayTotal = dayProgress.length;
    let dayPending = dayProgress.filter(p => p.status === 'pending').length;

    if (dayStart.isAfter(now.clone().startOf('day')) && schedule && schedule.weeklySchedule) {
      const daySchedule = schedule.weeklySchedule.find(s => s.day === weekDaysMap[dayStart.day()]);
      if (daySchedule && daySchedule.isActive && daySchedule.items) {
        const itemsCount = daySchedule.items.filter(i => i.learningObjective).length;
        dayTotal = itemsCount;
        dayPending = itemsCount;
      }
    }

    return {
      day,
      completed: dayProgress.filter(p => p.status === 'completed').length,
      missed: dayProgress.filter(p => p.status === 'missed').length,
      pending: dayPending,
      partial: dayProgress.filter(p => p.status === 'partial').length,
      total: dayTotal,
      timeSpent: parseFloat((dayProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0) / 60).toFixed(2)),
      timeSpentMinutes: dayProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0)
    };
  });
  return chartData;
}

async function run() {
  await mongoose.connect('mongodb+srv://karan9302451907_db_user:6ied6lVYh6XBXR3r@cluster0.pi6yzn6.mongodb.net/?appName=Cluster0');
  
  const user = await User.findOne();
  const userTz = 'Asia/Kolkata';
  
  try {
    const weeklyData = await getWeeklyChartData(user._id, userTz);
    console.log('Weekly data success:', weeklyData.length, 'days');
  } catch (e) {
    console.error('Weekly Chart Error:', e);
  }
  
  process.exit(0);
}

run();
