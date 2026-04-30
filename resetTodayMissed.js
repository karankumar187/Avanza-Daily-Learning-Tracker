const mongoose = require('/Users/karankumar/Documents/Projects/LearnFlow/server/node_modules/mongoose');
const DailyProgress = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/DailyProgress');
const moment = require('/Users/karankumar/Documents/Projects/LearnFlow/server/node_modules/moment-timezone');

async function run() {
  await mongoose.connect('mongodb+srv://karan9302451907_db_user:6ied6lVYh6XBXR3r@cluster0.pi6yzn6.mongodb.net/?appName=Cluster0');

  // Reset ALL "missed" records for UTC today back to "pending"
  // (the day hasn't ended yet so nothing can be legitimately missed)
  const todayStart = moment.utc().startOf('day').toDate();
  const todayEnd = moment.utc().endOf('day').toDate();

  console.log('UTC today:', todayStart.toISOString(), '→', todayEnd.toISOString());

  const result = await DailyProgress.updateMany(
    {
      date: { $gte: todayStart, $lte: todayEnd },
      status: 'missed'
    },
    { status: 'pending', updatedAt: Date.now() }
  );

  console.log(`✅ Reset ${result.modifiedCount} records from "missed" → "pending" for UTC today`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
