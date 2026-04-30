const express = require('express');
const { executeHourlyTasks } = require('../controllers/cronController');

const router = express.Router();

router.post('/hourly', executeHourlyTasks);
router.get('/hourly', executeHourlyTasks); // Support GET for easier triggering

// Keep-warm ping — hit every 5 min via cron-job.org to prevent cold starts
router.get('/ping', (req, res) => {
  res.status(200).json({ ok: true, ts: Date.now() });
});

module.exports = router;
