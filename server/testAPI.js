const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const analyticsControl = require('./controllers/analyticsController');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const Schedule = require('./models/Schedule');
  const userObj = await Schedule.findOne({ isDefault: true }).select('user');
  if (!userObj) { console.log('No user'); process.exit(0); }

  let req = { user: { id: userObj.user }, query: { period: 'daily' } };
  let res = {
    status: (s) => ({ json: (data) => console.log('Status', s) })
  };
  let next = (err) => console.error("NEXT ERR:", err);

  try {
    console.log("Testing getOverallAnalytics");
    await analyticsControl.getOverallAnalytics(req, res, next);

    console.log("Testing getStreakInfo");
    await analyticsControl.getStreakInfo(req, res, next);

    console.log("Testing getAnalyticsByObjective");
    await analyticsControl.getAnalyticsByObjective(req, res, next);

    console.log("Testing getCategoryAnalytics");
    await analyticsControl.getCategoryAnalytics(req, res, next);

  } catch (e) {
    console.error("CAUGHT EXCEPTION:", e);
  }
  process.exit(0);
}
test();
