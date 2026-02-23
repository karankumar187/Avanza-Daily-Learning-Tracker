const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Schedule = require('./models/Schedule');
const DailyProgress = require('./models/DailyProgress');
const syncProgress = require('./utils/syncProgress');

dotenv.config({ path: './.env' });

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");
  const user = await Schedule.findOne({ isDefault: true }).select('user weeklySchedule');
  if (!user) { console.log("No user"); process.exit(0); }

  const userId = user.user;
  console.log("Syncing for user:", userId);

  let targetDay = user.weeklySchedule.find(s => s.day === 'monday');
  console.log("Monday schedule items count:", targetDay ? targetDay.items.length : 0);

  // count before
  let countBefore = await DailyProgress.countDocuments({ user: userId });
  console.log("Progress count before:", countBefore);

  await syncProgress(userId, 0); // sync today

  let countAfter = await DailyProgress.countDocuments({ user: userId });
  console.log("Progress count after :", countAfter);

  const todayProgress = await DailyProgress.find({ user: userId }).sort({ date: -1 }).limit(10);
  console.log("Today progress stats:");
  todayProgress.forEach(p => console.log(`  [${p.status}] Obj: ${p.learningObjective}`));

  process.exit(0);
}
test();
