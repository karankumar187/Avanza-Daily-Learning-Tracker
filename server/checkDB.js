const mongoose = require('mongoose');
const DailyProgress = require('./models/DailyProgress');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const records = await DailyProgress.find({}).sort({ date: -1 }).limit(15).lean();
    console.log("Recent DailyProgress records:");
    records.forEach(r => {
        console.log(`- ID: ${r._id}, Obj: ${r.learningObjective}, Date: ${r.date}, Status: ${r.status}, timeSpent: ${r.timeSpent}`);
    });

    const Schedule = require('./models/Schedule');
    const schedules = await Schedule.find({}).lean();
    console.log("\nSchedules:");
    schedules.forEach(s => {
        console.log(`- ID: ${s._id}, Default: ${s.isDefault}, Active: ${s.isActive}`);
    });

    mongoose.disconnect();
}

check().catch(console.error);
