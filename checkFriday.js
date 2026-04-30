const mongoose = require('/Users/karankumar/Documents/Projects/LearnFlow/server/node_modules/mongoose');
const Schedule = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/Schedule');
const User = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/User');

async function run() {
  await mongoose.connect('mongodb+srv://karan9302451907_db_user:6ied6lVYh6XBXR3r@cluster0.pi6yzn6.mongodb.net/?appName=Cluster0');
  const user = await User.findOne({ email: 'theunbelieveablekaran@gmail.com' });
  
  const schedule = await Schedule.findOne({ user: user._id, isDefault: true }).populate('weeklySchedule.items.learningObjective');
  
  const friday = schedule.weeklySchedule.find(s => s.day === 'friday');
  console.log('Friday schedule:');
  friday.items.forEach(item => {
    console.log(`- ${item.learningObjective?.title}`);
  });
  
  process.exit(0);
}

run();
