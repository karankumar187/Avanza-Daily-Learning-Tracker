const mongoose = require('/Users/karankumar/Documents/Projects/LearnFlow/server/node_modules/mongoose');
const DailyProgress = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/DailyProgress');
const User = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/User');
const moment = require('/Users/karankumar/Documents/Projects/LearnFlow/server/node_modules/moment-timezone');

async function run() {
  await mongoose.connect('mongodb+srv://karan9302451907_db_user:6ied6lVYh6XBXR3r@cluster0.pi6yzn6.mongodb.net/?appName=Cluster0');
  
  // Reset ALL today's "missed" tasks back to "pending" (they were wrongly marked)
  // "Today" in UTC = April 30, 2026
  const todayStart = moment.utc().startOf('day').toDate();
  const todayEnd = moment.utc().endOf('day').toDate();
  
  console.log('Resetting missed→pending for UTC today:', todayStart, 'to', todayEnd);
  
  const result = await DailyProgress.updateMany(
    {
      date: { $gte: todayStart, $lte: todayEnd },
      status: 'missed'
    },
    {
      status: 'pending',
      updatedAt: Date.now()
    }
  );
  
  console.log('Fixed records:', result.modifiedCount, 'tasks reset to pending');
  process.exit(0);
}

run();
