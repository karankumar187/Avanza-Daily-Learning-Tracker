const mongoose = require('/Users/karankumar/Documents/Projects/LearnFlow/server/node_modules/mongoose');
const DailyProgress = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/DailyProgress');
const LearningObjective = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/LearningObjective');
const User = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/User');
const moment = require('/Users/karankumar/Documents/Projects/LearnFlow/server/node_modules/moment-timezone');

async function run() {
  await mongoose.connect('mongodb+srv://karan9302451907_db_user:6ied6lVYh6XBXR3r@cluster0.pi6yzn6.mongodb.net/?appName=Cluster0');
  
  const user = await User.findOne();
  // Simulate the frontend sending x-timezone: 'Asia/Kolkata'
  const userTz = 'Asia/Kolkata';
  
  const queryDateStart = moment.tz(userTz).startOf('day').toDate();
  const queryDateEnd = moment.tz(userTz).endOf('day').toDate();
  
  console.log('Query Start:', queryDateStart);
  console.log('Query End:', queryDateEnd);

  const progress = await DailyProgress.find({
      user: user._id,
      date: {
        $gte: queryDateStart,
        $lte: queryDateEnd
      }
    }).populate('learningObjective', 'title');

  console.log('Today Progress from DB using IST:');
  progress.forEach(p => console.log(`- ${p.learningObjective?.title}: ${p.status} (date: ${p.date.toISOString()})`));
  
  process.exit(0);
}

run();
