const mongoose = require('/Users/karankumar/Documents/Projects/LearnFlow/server/node_modules/mongoose');
const User = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/User');

async function run() {
  await mongoose.connect('mongodb+srv://karan9302451907_db_user:6ied6lVYh6XBXR3r@cluster0.pi6yzn6.mongodb.net/?appName=Cluster0');
  
  const users = await User.find({});
  console.log('Total users:', users.length);
  users.forEach(u => console.log(`- ${u.name} (${u.email}) [TZ: ${u.timezone}]`));
  
  process.exit(0);
}

run();
