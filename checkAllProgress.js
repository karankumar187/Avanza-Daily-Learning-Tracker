const mongoose = require('/Users/karankumar/Documents/Projects/LearnFlow/server/node_modules/mongoose');
const DailyProgress = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/DailyProgress');
const LearningObjective = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/LearningObjective');
const User = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/User');

async function run() {
  await mongoose.connect('mongodb+srv://karan9302451907_db_user:6ied6lVYh6XBXR3r@cluster0.pi6yzn6.mongodb.net/?appName=Cluster0');
  
  const allProgress = await DailyProgress.find()
    .populate('user', 'email')
    .populate('learningObjective', 'title')
    .sort({ date: -1 });

  const aiProgress = allProgress.filter(p => p.learningObjective && p.learningObjective.title === 'Artificial Intelligence');
  
  console.log('AI Progress records:');
  aiProgress.forEach(p => {
    console.log(`- User: ${p.user?.email}, Date: ${p.date.toISOString()}, Status: ${p.status}`);
  });
  
  process.exit(0);
}

run();
