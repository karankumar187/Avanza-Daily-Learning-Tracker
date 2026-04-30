const mongoose = require('/Users/karankumar/Documents/Projects/LearnFlow/server/node_modules/mongoose');
const LearningObjective = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/LearningObjective');
const DailyProgress = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/DailyProgress');
const Schedule = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/Schedule');
const User = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/User');

async function run() {
  await mongoose.connect('mongodb+srv://karan9302451907_db_user:6ied6lVYh6XBXR3r@cluster0.pi6yzn6.mongodb.net/?appName=Cluster0');
  console.log('Connected to DB');

  const user = await User.findOne();
  console.log('User TZ:', user.timezone);

  const progress = await DailyProgress.find({ user: user._id })
    .populate('learningObjective', 'title')
    .sort({ date: -1 })
    .limit(10);

  console.log('Recent Progress:');
  progress.forEach(p => {
    console.log(`- [${p.date.toISOString()}] ${p.learningObjective?.title}: ${p.status}`);
  });

  process.exit(0);
}

run();
