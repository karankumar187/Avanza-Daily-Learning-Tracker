const mongoose = require('/Users/karankumar/Documents/Projects/LearnFlow/server/node_modules/mongoose');
const DailyProgress = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/DailyProgress');
const Schedule = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/Schedule');
const LearningObjective = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/LearningObjective');
const User = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/User');
const moment = require('/Users/karankumar/Documents/Projects/LearnFlow/server/node_modules/moment-timezone');

async function run() {
  await mongoose.connect('mongodb+srv://karan9302451907_db_user:6ied6lVYh6XBXR3r@cluster0.pi6yzn6.mongodb.net/?appName=Cluster0');

  // ---- Step 1: Show what's currently in the DB for UTC today ----
  const todayUTCStart = moment.utc().startOf('day').toDate(); // 2026-04-30 00:00 UTC
  const todayUTCEnd = moment.utc().endOf('day').toDate();     // 2026-04-30 23:59 UTC

  console.log('\n--- UTC today range:', todayUTCStart, 'to', todayUTCEnd);

  const users = await User.find({});
  for (const user of users) {
    const records = await DailyProgress.find({
      user: user._id,
      date: { $gte: todayUTCStart, $lte: todayUTCEnd }
    }).populate('learningObjective', 'title');

    if (records.length > 0) {
      console.log(`\nUser: ${user.email}`);
      records.forEach(r => {
        console.log(`  - ${r.learningObjective?.title}: ${r.status} | stored date: ${r.date.toISOString()}`);
      });

      // Step 2: Delete records that were stored at IST midnight (18:30 UTC) — they're the wrong day's tasks
      const istMidnightRecords = records.filter(r => r.date.toISOString().includes('T18:30:00'));
      if (istMidnightRecords.length > 0) {
        const idsToDelete = istMidnightRecords.map(r => r._id);
        await DailyProgress.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`  ✓ Deleted ${istMidnightRecords.length} IST-midnight records`);
      }

      // Step 3: Check what remains and if today (UTC Thursday) already has correct records
      const remaining = records.filter(r => !r.date.toISOString().includes('T18:30:00'));
      console.log(`  Remaining correct UTC records: ${remaining.length}`);
    }
  }

  // Step 4: Show what Thursday's schedule SHOULD be for each user
  console.log('\n--- Thursday UTC schedule for each user ---');
  const weekDaysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayUTCDayName = weekDaysMap[moment.utc().day()]; // What day is today in UTC
  console.log('Today in UTC is:', moment.utc().format('dddd YYYY-MM-DD'), '(', todayUTCDayName, ')');

  for (const user of users) {
    const schedule = await Schedule.findOne({ user: user._id, isDefault: true, isActive: true })
      .populate('weeklySchedule.items.learningObjective');
    if (!schedule) continue;
    const daySchedule = schedule.weeklySchedule.find(s => s.day === todayUTCDayName);
    if (daySchedule && daySchedule.items && daySchedule.items.length > 0) {
      console.log(`\nUser: ${user.email} — ${todayUTCDayName} tasks:`);
      daySchedule.items.forEach(item => {
        if (item.learningObjective) console.log(`  - ${item.learningObjective.title}`);
      });

      // Step 5: Create correct UTC midnight records for today if missing
      const nowUTCMidnight = moment.utc().startOf('day').toDate();
      for (const item of daySchedule.items) {
        if (!item.learningObjective) continue;
        const exists = await DailyProgress.findOne({
          user: user._id,
          learningObjective: item.learningObjective._id,
          date: { $gte: todayUTCStart, $lte: todayUTCEnd }
        });
        if (!exists) {
          await DailyProgress.create({
            user: user._id,
            learningObjective: item.learningObjective._id,
            date: nowUTCMidnight,
            status: 'pending',
            timeSpent: 0
          });
          console.log(`  ✓ Created pending record for ${item.learningObjective.title}`);
        } else {
          console.log(`  Already exists: ${item.learningObjective.title} (${exists.status})`);
        }
      }
    }
  }

  console.log('\nDone!');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
