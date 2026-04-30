/**
 * UTC Migration Script
 * 
 * Problems to fix:
 * 1. Users have timezone: 'Asia/Calcutta' instead of 'UTC'
 * 2. DailyProgress records stored at T18:30:00.000Z (IST midnight) instead of T00:00:00.000Z (UTC midnight)
 *    - T18:30 UTC on April 30 = midnight IST on May 1 → should be T00:00 UTC on May 1
 * 3. Duplicate records for same (user, learningObjective, day) after migration
 */

const mongoose = require('/Users/karankumar/Documents/Projects/LearnFlow/server/node_modules/mongoose');
const DailyProgress = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/DailyProgress');
const User = require('/Users/karankumar/Documents/Projects/LearnFlow/server/models/User');
const moment = require('/Users/karankumar/Documents/Projects/LearnFlow/server/node_modules/moment-timezone');

async function run() {
  await mongoose.connect('mongodb+srv://karan9302451907_db_user:6ied6lVYh6XBXR3r@cluster0.pi6yzn6.mongodb.net/?appName=Cluster0');
  console.log('✅ Connected to MongoDB\n');

  // ===== STEP 1: Update all user timezones to UTC =====
  console.log('===== STEP 1: Fixing user timezones =====');
  const nonUtcUsers = await User.find({ timezone: { $ne: 'UTC' } });
  console.log(`Found ${nonUtcUsers.length} users with non-UTC timezone:`);
  nonUtcUsers.forEach(u => console.log(`  - ${u.email}: ${u.timezone}`));

  if (nonUtcUsers.length > 0) {
    const tzResult = await User.updateMany(
      { timezone: { $ne: 'UTC' } },
      { timezone: 'UTC' }
    );
    console.log(`✅ Updated ${tzResult.modifiedCount} users to UTC\n`);
  } else {
    console.log('✅ All users already on UTC\n');
  }

  // ===== STEP 2: Find and fix IST-midnight records =====
  // IST midnight = 18:30 UTC. These records are stored at HH=18, MM=30
  // They represent the START of the next day in IST → should be next day UTC midnight
  console.log('===== STEP 2: Migrating IST midnight records (T18:30:00Z → next day T00:00:00Z) =====');

  const allProgress = await DailyProgress.find({});
  console.log(`Total DailyProgress records: ${allProgress.length}`);

  let migratedCount = 0;
  let alreadyCorrectCount = 0;

  for (const record of allProgress) {
    const d = record.date;
    const h = d.getUTCHours();
    const m = d.getUTCMinutes();

    if (h === 18 && m === 30) {
      // This is an IST-midnight record → it belongs to the NEXT UTC day
      const correctDate = moment.utc(d).add(5, 'hours').add(30, 'minutes').startOf('day').toDate();
      record.date = correctDate;
      await record.save();
      migratedCount++;
    } else if (h === 0 && m === 0) {
      alreadyCorrectCount++;
    } else {
      // Some other weird time — normalize to UTC midnight of same day
      const normalizedDate = moment.utc(d).startOf('day').toDate();
      if (normalizedDate.getTime() !== d.getTime()) {
        record.date = normalizedDate;
        await record.save();
        migratedCount++;
      } else {
        alreadyCorrectCount++;
      }
    }
  }

  console.log(`✅ Migrated ${migratedCount} IST records to correct UTC midnight`);
  console.log(`✅ Already correct: ${alreadyCorrectCount} records\n`);

  // ===== STEP 3: Deduplicate records (same user + learningObjective + date) =====
  console.log('===== STEP 3: Deduplicating records =====');

  const STATUS_PRIORITY = { completed: 4, partial: 3, missed: 2, pending: 1, skipped: 0 };

  const users = await User.find({});
  let totalDeleted = 0;

  for (const user of users) {
    const userProgress = await DailyProgress.find({ user: user._id }).sort({ date: 1 });

    // Group by (learningObjective + date)
    const groups = new Map();
    for (const record of userProgress) {
      const dateKey = moment.utc(record.date).format('YYYY-MM-DD');
      const objKey = record.learningObjective ? record.learningObjective.toString() : 'null';
      const key = `${dateKey}:${objKey}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(record);
    }

    const toDelete = [];
    for (const [key, records] of groups) {
      if (records.length <= 1) continue;

      // Sort by status priority desc, keep highest priority
      records.sort((a, b) =>
        (STATUS_PRIORITY[b.status] || 0) - (STATUS_PRIORITY[a.status] || 0)
      );

      // Keep first (highest priority), delete the rest
      const duplicates = records.slice(1);
      duplicates.forEach(d => toDelete.push(d._id));
      console.log(`  Duplicate found for user ${user.email} on ${key.split(':')[0]}: keeping ${records[0].status}, deleting ${duplicates.length}`);
    }

    if (toDelete.length > 0) {
      await DailyProgress.deleteMany({ _id: { $in: toDelete } });
      totalDeleted += toDelete.length;
    }
  }

  console.log(`✅ Deleted ${totalDeleted} duplicate records\n`);

  // ===== STEP 4: Verification =====
  console.log('===== STEP 4: Verification =====');

  const todayUTC = moment.utc().format('YYYY-MM-DD');
  console.log(`Today in UTC: ${todayUTC}`);

  for (const user of users) {
    const todayRecords = await DailyProgress.find({
      user: user._id,
      date: {
        $gte: moment.utc().startOf('day').toDate(),
        $lte: moment.utc().endOf('day').toDate()
      }
    }).populate('learningObjective', 'title');

    if (todayRecords.length > 0) {
      console.log(`\n${user.email} (UTC today: ${todayUTC}):`);
      todayRecords.forEach(r => {
        const dateStr = r.date.toISOString();
        const isCorrect = dateStr.includes('T00:00:00');
        console.log(`  ${isCorrect ? '✅' : '⚠️ '} ${r.learningObjective?.title}: ${r.status} | ${dateStr}`);
      });
    }
  }

  console.log('\n✅ Migration complete!');
  process.exit(0);
}

run().catch(e => { console.error('Migration failed:', e); process.exit(1); });
